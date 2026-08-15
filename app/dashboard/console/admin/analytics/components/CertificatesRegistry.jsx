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
            <th style={{ padding: '0.75rem 0.5rem' }}>Type & Track</th>
            <th style={{ padding: '0.75rem 0.5rem' }}>Score / Status</th>
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
              <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text)' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  marginRight: '0.4rem',
                  background: cert.cert_type === 'INTERNSHIP' ? 'rgba(59, 130, 246, 0.15)' :
                              cert.cert_type === 'TRAINING' ? 'rgba(168, 85, 247, 0.15)' :
                              cert.cert_type === 'LOR' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: cert.cert_type === 'INTERNSHIP' ? '#3b82f6' :
                         cert.cert_type === 'TRAINING' ? '#a855f7' :
                         cert.cert_type === 'LOR' ? '#eab308' : '#10b981',
                }}>
                  {cert.cert_type || 'ROADMAP'}
                </span>
                {cert.stream_or_track || cert.roadmapTitle || 'General'}
              </td>
              <td style={{ padding: '0.75rem 0.5rem' }}>
                {cert.score !== undefined ? (
                  <span style={{ color: 'var(--green)', fontWeight: '800' }}>{cert.score}%</span>
                ) : (
                  <span style={{ color: cert.is_revoked ? '#ef4444' : 'var(--green)', fontWeight: '700' }}>
                    {cert.is_revoked ? 'REVOKED' : 'ACTIVE'}
                  </span>
                )}
              </td>
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
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    background: 'var(--green)',
                    color: '#000',
                    fontWeight: '700',
                    fontSize: '0.78rem',
                    textDecoration: 'none',
                  }}
                >
                  Verify Page ↗
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
