'use client';

import React from 'react';
import Link from 'next/link';

export default function CertificatesRegistry({ loading, filteredCerts, searchTerm }) {
  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
        <p>⏳ Loading real certificate records from Firestore...</p>
      </div>
    );
  }

  if (filteredCerts.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📜</div>
        {searchTerm ? (
          <p style={{ margin: 0 }}>No certificates match "{searchTerm}".</p>
        ) : (
          <p style={{ margin: 0 }}>No certificates issued in Firestore database yet. Earned student certificates will automatically appear here.</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--muted)' }}>
            <th style={{ padding: '0.75rem 0.5rem' }}>Student / Recipient</th>
            <th style={{ padding: '0.75rem 0.5rem' }}>Roadmap Track</th>
            <th style={{ padding: '0.75rem 0.5rem' }}>Exam Score</th>
            <th style={{ padding: '0.75rem 0.5rem' }}>Certificate ID</th>
            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Verification</th>
          </tr>
        </thead>
        <tbody>
          {filteredCerts.map((cert) => (
            <tr key={cert.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '0.75rem 0.5rem' }}>
                <div style={{ fontWeight: '700', color: 'var(--text)' }}>{cert.name}</div>
                {cert.email && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{cert.email}</div>
                )}
              </td>
              <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text)' }}>{cert.roadmapTitle}</td>
              <td style={{ padding: '0.75rem 0.5rem', color: 'var(--green)', fontWeight: '800' }}>{cert.score}%</td>
              <td style={{ padding: '0.75rem 0.5rem' }}>
                <code style={{ background: 'var(--surface-raised)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--accent)' }}>
                  {cert.id}
                </code>
              </td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                <Link
                  href={`/certificate/${cert.id}`}
                  target="_blank"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    color: 'var(--green)',
                    fontWeight: '700',
                    textDecoration: 'none',
                    background: 'var(--green-subtle)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                  }}
                >
                  View Certificate ↗
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
