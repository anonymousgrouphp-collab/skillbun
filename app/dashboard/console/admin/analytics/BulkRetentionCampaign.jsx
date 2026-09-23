'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { recommendEmail } from '@/utils/shared/emailRecommendation';

const SEND_INTERVAL_MS = 6500;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatWait(ms) {
  const minutes = Math.max(1, Math.ceil(ms / 60000));
  return minutes === 1 ? 'about 1 minute' : `about ${minutes} minutes`;
}

function getRetryDelay(response) {
  const seconds = Number(response.headers.get('Retry-After'));
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 60000;
}

export default function BulkRetentionCampaign({ students = [], user, onEmailSent, onBusyChange, loading = false, blocked = false }) {
  const [run, setRun] = useState(null);
  const [notice, setNotice] = useState('');
  const stopRequested = useRef(false);
  const actionInProgress = useRef(false);

  useEffect(() => () => {
    if (actionInProgress.current) stopRequested.current = true;
  }, []);

  const recipients = useMemo(() => students.map(student => ({
    student,
    recommendation: recommendEmail(student),
  })).filter(row => row.recommendation.eligible), [students]);
  const freshDraftRecipients = recipients.filter(row => row.recommendation.needsGeneration);
  const standardRecipients = recipients.length - freshDraftRecipients.length;
  const excludedCount = Math.max(0, students.length - recipients.length);
  const busy = run?.status === 'running' || run?.status === 'waiting';

  const setBusy = value => onBusyChange?.(value);

  const addResult = (status, recipient, detail = '') => {
    setRun(previous => {
      if (!previous) return previous;
      const results = [...previous.results, {
        uid: recipient.uid,
        name: recipient.name,
        email: recipient.email,
        status,
        detail,
      }];
      return {
        ...previous,
        results,
        sent: results.filter(result => result.status === 'sent').length,
        skipped: results.filter(result => result.status === 'skipped').length,
        review: results.filter(result => result.status === 'review').length,
      };
    });
  };

  const updateRun = updates => setRun(previous => previous ? { ...previous, ...updates } : previous);

  const waitBeforeRetry = async (retryMs, index) => {
    const resumeAt = Date.now() + retryMs;
    updateRun({ status: 'waiting', nextIndex: index, resumeAt, current: null, message: `The existing sending limit was reached. The campaign will resume in ${formatWait(retryMs)}.` });
    while (Date.now() < resumeAt) {
      if (stopRequested.current) {
        updateRun({ status: 'paused', nextIndex: index, resumeAt, current: null, message: `Paused. You can resume after ${formatWait(resumeAt - Date.now())}.` });
        return false;
      }
      await wait(Math.min(5000, resumeAt - Date.now()));
    }
    updateRun({ status: 'running', message: '', resumeAt: null });
    return true;
  };

  const processQueue = async (queue, startIndex, initialRun = null) => {
    if (actionInProgress.current) return;
    actionInProgress.current = true;
    stopRequested.current = false;
    setBusy(true);
    const resumeAt = initialRun?.resumeAt || null;

    try {
      if (resumeAt && resumeAt > Date.now()) {
        const ready = await waitBeforeRetry(resumeAt - Date.now(), startIndex);
        if (!ready) return;
      }

      for (let index = startIndex; index < queue.length; index += 1) {
        if (stopRequested.current) {
          updateRun({ status: 'paused', nextIndex: index, current: null, message: 'Paused. Resume to continue with the next student.' });
          return;
        }

        const recipient = queue[index];
        let sendStarted = false;
        updateRun({ status: 'running', nextIndex: index, current: recipient, message: '' });

        try {
          const token = await user.getIdToken();
          const draftResponse = await fetch('/api/admin/emails/drafts', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: recipient.uid, action: 'prepare' }),
          });
          const draftResult = await draftResponse.json().catch(() => ({}));

          if (draftResponse.status === 429) {
            const ready = await waitBeforeRetry(getRetryDelay(draftResponse), index);
            if (!ready) return;
            index -= 1;
            continue;
          }
          if (draftResponse.status === 409) {
            addResult('skipped', recipient, draftResult.error || 'No longer eligible.');
            continue;
          }
          if (!draftResponse.ok || !draftResult.templateId) {
            updateRun({ status: 'paused', nextIndex: index, current: null, message: draftResult.error || `Could not prepare a draft for ${recipient.email}. Resume to retry.` });
            return;
          }

          sendStarted = true;
          const sendResponse = await fetch('/api/admin/emails/send', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientEmail: recipient.email,
              studentName: recipient.name,
              templateId: draftResult.templateId,
              recommendationUid: recipient.uid,
              roadmapTitle: recipient.recommendation.roadmapTitle,
              progressCount: recipient.recommendation.progressCount,
              roadmapSlug: recipient.recommendation.roadmapSlug,
              degree: recipient.degree,
              isPreview: false,
              forceOverride: false,
            }),
          });
          const sendResult = await sendResponse.json().catch(() => ({}));

          if (sendResponse.status === 429) {
            const ready = await waitBeforeRetry(getRetryDelay(sendResponse), index);
            if (!ready) return;
            index -= 1;
            continue;
          }
          if (sendResponse.status === 409 || (sendResponse.status === 400 && sendResult.isUnsubscribed)) {
            addResult('skipped', recipient, sendResult.error || 'No longer eligible.');
            continue;
          }
          if (!sendResponse.ok || !sendResult.success) {
            addResult('review', recipient, sendResult.error || 'Send outcome needs review; it was not retried automatically.');
            updateRun({ status: 'paused', nextIndex: index + 1, current: null, message: 'A send could not be confirmed. Check this recipient’s email history before continuing.' });
            return;
          }

          const sentAt = new Date().toISOString();
          onEmailSent?.({
            uid: recipient.uid,
            templateId: sendResult.sentTemplateId || draftResult.templateId,
            category: recipient.recommendation.category,
            roadmapSlug: recipient.recommendation.roadmapSlug,
            eventKey: recipient.recommendation.eventKey,
            sentAt,
          });
          addResult('sent', recipient, sendResult.message || 'Email sent.');
        } catch (error) {
          if (sendStarted) {
            addResult('review', recipient, error.message || 'Connection ended while sending; delivery could not be confirmed.');
            updateRun({ status: 'paused', nextIndex: index + 1, current: null, message: 'A send outcome is uncertain. Check email history before continuing.' });
          } else {
            updateRun({ status: 'paused', nextIndex: index, current: null, message: error.message || `Could not prepare ${recipient.email}. Resume to retry.` });
          }
          return;
        }

        updateRun({ nextIndex: index + 1, current: null });
        if (index + 1 < queue.length) {
          for (let waited = 0; waited < SEND_INTERVAL_MS; waited += 500) {
            if (stopRequested.current) break;
            await wait(Math.min(500, SEND_INTERVAL_MS - waited));
          }
        }
      }

      updateRun({ status: 'complete', nextIndex: queue.length, current: null, message: 'Campaign finished.' });
    } finally {
      setBusy(false);
      actionInProgress.current = false;
    }
  };

  const startCampaign = async mode => {
    if (actionInProgress.current || blocked) return;
    const selected = mode === 'fresh' ? freshDraftRecipients : recipients;
    const queue = selected.map(({ student, recommendation }) => ({
      uid: student.uid,
      name: student.name || 'Student',
      email: student.email,
      degree: student.degree || '',
      recommendation,
    }));
    if (!queue.length) {
      setNotice(mode === 'fresh' ? 'No eligible students currently need an unused or newly generated variation.' : 'No students are eligible for a recommended email right now.');
      return;
    }

    const standardCount = queue.filter(recipient => !recipient.recommendation.needsGeneration).length;
    const freshCount = queue.length - standardCount;
    const confirmText = [
      `This will send live emails to ${queue.length} eligible student${queue.length === 1 ? '' : 's'}.`,
      standardCount ? `${standardCount} will receive an unused recommended template.` : '',
      freshCount ? `${freshCount} need an unused saved draft or a new AI draft if none is available.` : '',
      'Unsubscribed students and anyone inside the 72-hour email gap are excluded and checked again before sending.',
      'Continue?',
    ].filter(Boolean).join('\n\n');
    if (!window.confirm(confirmText)) return;

    setNotice('');
    setRun({ status: 'running', mode, queue, nextIndex: 0, sent: 0, skipped: 0, review: 0, results: [], current: null, message: '' });
    await processQueue(queue, 0);
  };

  const pauseCampaign = () => {
    stopRequested.current = true;
    if (run?.status === 'waiting') {
      updateRun({ message: 'Pause requested. The campaign will stop its wait shortly.' });
    }
  };

  const resumeCampaign = async () => {
    if (!run || actionInProgress.current) return;
    await processQueue(run.queue, run.nextIndex, run);
  };

  const primary = {
    cursor: busy || blocked ? 'wait' : 'pointer',
    border: '1px solid var(--green)',
    borderRadius: '9px',
    padding: '0.7rem 1rem',
    fontWeight: '800',
    fontSize: '0.85rem',
    background: 'var(--green)',
    color: '#06130e',
    opacity: busy || blocked ? 0.65 : 1,
  };
  const secondary = {
    cursor: busy || blocked ? 'wait' : 'pointer',
    border: '1px solid var(--green)',
    borderRadius: '9px',
    padding: '0.7rem 1rem',
    fontWeight: '750',
    fontSize: '0.85rem',
    background: 'var(--surface-raised)',
    color: 'var(--green)',
    opacity: busy || blocked ? 0.65 : 1,
  };

  return (
    <section aria-labelledby="bulk-retention-title" style={{ margin: '0 0 1.25rem', padding: '1.2rem', border: '1px solid var(--border)', borderRadius: '14px', background: 'var(--surface-raised)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ maxWidth: '700px' }}>
          <h2 id="bulk-retention-title" style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text)' }}>Recommended student email campaign</h2>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--muted)', fontSize: '0.84rem', lineHeight: 1.55 }}>
            Review who is due, then send the next recommended email in a paced run. This checks every student, regardless of the table search. Keep this page open; if interrupted, reload and start again to filter out emails already logged as sent.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => startCampaign('all')} disabled={busy || loading || blocked} style={primary}>
            Send all eligible ({recipients.length})
          </button>
          <button type="button" onClick={() => startCampaign('fresh')} disabled={busy || loading || blocked || freshDraftRecipients.length === 0} style={secondary}>
            Send fresh-draft group ({freshDraftRecipients.length})
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.65rem', marginTop: '1rem' }}>
        {[
          { label: 'Ready templates', value: standardRecipients },
          { label: 'Need unused / fresh draft', value: freshDraftRecipients.length },
          { label: 'Automatically excluded', value: excludedCount },
        ].map(item => (
          <div key={item.label} style={{ border: '1px solid var(--border)', borderRadius: '9px', padding: '0.7rem 0.8rem', background: 'var(--card-bg)' }}>
            <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: '700' }}>{item.label}</div>
            <div style={{ color: 'var(--text)', fontSize: '1.25rem', fontWeight: '800', marginTop: '0.15rem' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <details style={{ marginTop: '0.85rem' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--green)', fontSize: '0.82rem', fontWeight: '750' }}>
          Review eligible recipients ({recipients.length})
        </summary>
        {recipients.length ? (
          <div style={{ maxHeight: '260px', overflow: 'auto', marginTop: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
              <thead><tr style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', color: 'var(--muted)' }}>
                <th style={{ padding: '0.55rem' }}>Student</th><th style={{ padding: '0.55rem' }}>Email</th><th style={{ padding: '0.55rem' }}>Next email</th><th style={{ padding: '0.55rem' }}>Why it is due</th>
              </tr></thead>
              <tbody>{recipients.map(({ student, recommendation }) => (
                <tr key={student.uid} style={{ borderTop: '1px solid var(--border)', color: 'var(--text)' }}>
                  <td style={{ padding: '0.55rem' }}>{student.name || 'Student'}</td>
                  <td style={{ padding: '0.55rem', overflowWrap: 'anywhere' }}>{student.email}</td>
                  <td style={{ padding: '0.55rem' }}>{recommendation.label}{recommendation.needsGeneration ? ' · unused / fresh draft' : ''}</td>
                  <td style={{ padding: '0.55rem', color: 'var(--muted)' }}>{recommendation.reason}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>No eligible recipients at this time.</p>}
      </details>

      {notice && <p role="status" style={{ margin: '0.8rem 0 0', color: 'var(--muted)', fontSize: '0.84rem' }}>{notice}</p>}

      {run && (
        <div aria-live="polite" style={{ marginTop: '1rem', padding: '0.9rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <strong style={{ color: 'var(--text)', fontSize: '0.86rem' }}>
              {run.status === 'complete' ? 'Campaign complete' : run.status === 'waiting' ? 'Waiting for the email limit to reset' : run.status === 'paused' ? 'Campaign paused' : 'Campaign running'}
              {' · '}{run.sent} sent · {run.skipped} skipped · {run.review} need review · {run.nextIndex}/{run.queue.length} processed
            </strong>
            {busy ? <button type="button" onClick={pauseCampaign} style={{ ...secondary, padding: '0.45rem 0.7rem' }}>{run.status === 'waiting' ? 'Pause wait' : 'Pause after this email'}</button> : null}
            {run.status === 'paused' && run.nextIndex < run.queue.length ? <button type="button" onClick={resumeCampaign} style={{ ...primary, padding: '0.45rem 0.7rem' }}>Resume</button> : null}
          </div>
          <div role="progressbar" aria-valuemin={0} aria-valuemax={run.queue.length} aria-valuenow={run.nextIndex} style={{ height: '6px', marginTop: '0.65rem', borderRadius: '8px', background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{ width: `${run.queue.length ? (run.nextIndex / run.queue.length) * 100 : 0}%`, height: '100%', background: 'var(--green)' }} />
          </div>
          {run.current && <p style={{ margin: '0.6rem 0 0', color: 'var(--muted)', fontSize: '0.8rem' }}>Preparing or sending to {run.current.name} ({run.current.email})…</p>}
          {run.message && <p role="status" style={{ margin: '0.6rem 0 0', color: 'var(--muted)', fontSize: '0.8rem' }}>{run.message}</p>}
          {run.results.length > 0 && (
            <details style={{ marginTop: '0.6rem' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--green)', fontSize: '0.8rem', fontWeight: '700' }}>View campaign results</summary>
              <ul style={{ maxHeight: '180px', overflowY: 'auto', margin: '0.5rem 0 0', paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
                {run.results.map((result, index) => <li key={`${result.uid}-${index}`} style={{ margin: '0.25rem 0' }}>{result.name} · {result.email} — {result.status}{result.detail ? `: ${result.detail}` : ''}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
