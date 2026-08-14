'use client';

import Link from 'next/link';

export default function Error({ error, reset }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: 'var(--bg)',
      color: 'var(--text)',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg)',
        padding: '3rem',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h2 style={{
          color: 'var(--green)',
          fontSize: '2rem',
          marginBottom: '1rem',
          fontFamily: 'var(--font-fredoka), cursive'
        }}>Oops! Something went wrong</h2>
        <p style={{
          color: 'var(--subtle-text, var(--muted))',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          We encountered an unexpected error.
        </p>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--green)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontFamily: 'var(--font-nunito), sans-serif'
            }}
          >
            Try Again
          </button>
          <Link href="/" style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'transparent',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '700',
            fontFamily: 'var(--font-nunito), sans-serif'
          }}>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
