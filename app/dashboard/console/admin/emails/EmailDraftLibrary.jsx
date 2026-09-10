'use client';

import { useEffect, useState } from 'react';
import { EMAIL_CATEGORIES } from '@/utils/shared/emailRecommendation';
import { renderSavedEmail } from '@/utils/shared/emailDraft';

const control = { padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', background: 'var(--surface-raised)', maxWidth: '100%' };
export default function EmailDraftLibrary({ user, fixedCategory, onChoose }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(fixedCategory || 'welcome');
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const activeCategory = fixedCategory || category;
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setBusy(true); setError('');
      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/emails/drafts?category=${encodeURIComponent(activeCategory)}&search=${encodeURIComponent(search)}`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (!controller.signal.aborted) { setDrafts(result.drafts); setCursor(result.nextCursor); }
      } catch (err) { if (!controller.signal.aborted) setError(err.message); }
      finally { if (!controller.signal.aborted) setBusy(false); }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [open, activeCategory, search, user]);
  async function loadMore() {
    setBusy(true); setError('');
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/emails/drafts?category=${encodeURIComponent(activeCategory)}&search=${encodeURIComponent(search)}&cursor=${cursor}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setDrafts(prev => [...prev, ...result.drafts]); setCursor(result.nextCursor);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function generate() {
    setBusy(true); setError('');
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/emails/drafts', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ category: activeCategory, action: 'generate' }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setDrafts(prev => [result.draft, ...prev.filter(d => d.id !== result.draft.id)]);
      setPreview(result.preview);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <details onToggle={event => setOpen(event.currentTarget.open)} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', marginBottom: '1rem', background: 'var(--surface)', color: 'var(--text)' }}>
    <summary style={{ cursor: 'pointer', fontWeight: 800 }}>Saved AI email library</summary>
    {open && <div style={{ marginTop: '1rem' }}>
      <p style={{ color: 'var(--muted)' }}>Every new variation is saved for reuse. Review drafts before sending from the Student CRM.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {!fixedCategory && <select aria-label="Draft category" value={category} disabled={busy} onChange={e => { setCategory(e.target.value); setPreview(null); }} style={control}>{Object.entries(EMAIL_CATEGORIES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>}
        <input aria-label="Search saved drafts by name prefix" placeholder="Search name (starts with…)" value={search} onChange={e => setSearch(e.target.value)} style={control} />
        <button type="button" disabled={busy} onClick={generate} style={control}>{busy ? 'Working…' : 'Create and save new variation'}</button>
      </div>
      {error && <p role="alert">{error}</p>}
      {!busy && !error && !drafts.length && <p>No saved variations in this category yet.</p>}
      <ul style={{ paddingLeft: 20 }}>{drafts.map(draft => <li key={draft.id} style={{ marginBottom: 12, overflowWrap: 'anywhere' }}>
        <strong>{draft.content.name}</strong> — {draft.content.subject}
        <div style={{ display: 'flex', gap: 8, marginTop: 5 }}>
          <button type="button" style={control} onClick={() => setPreview(renderSavedEmail(draft, { name: 'Sample Student', roadmapTitle: 'your chosen track' }))}>Preview</button>
          {onChoose && <button type="button" disabled={busy} style={control} onClick={async () => { setBusy(true); try { await onChoose(draft); } finally { setBusy(false); } }}>Use for this student</button>}
        </div>
      </li>)}</ul>
      {cursor && <button type="button" style={control} disabled={busy} onClick={loadMore}>Load more</button>}
      {preview && <div><p><strong>{preview.subject}</strong></p><iframe title="Saved AI email preview" sandbox="" srcDoc={preview.html} style={{ width: '100%', height: 560, border: '1px solid var(--border)', borderRadius: 8 }} /></div>}
    </div>}
  </details>;
}
