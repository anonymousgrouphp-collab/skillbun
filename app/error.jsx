'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log unexpected client runtime errors for monitoring
    if (error) {
      console.error('[SkillBun Error Boundary Caught]:', error)
    }
  }, [error])

  const errorMessage = error?.message && process.env.NODE_ENV === 'development'
    ? error.message
    : 'We encountered an unexpected error while loading this page.'

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
      textAlign: 'center',
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg)',
        padding: '2.5rem 2rem',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      }}>
        {/* Brand Lockup */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          marginBottom: '1.5rem',
        }}>
          <Image
            src="/logo.png"
            alt="SkillBun Logo"
            width={40}
            height={40}
            style={{ objectFit: 'contain' }}
          />
          <span style={{
            fontFamily: 'var(--font-fredoka), cursive',
            color: 'var(--green)',
            fontSize: '1.4rem',
            fontWeight: '700',
            letterSpacing: '0.02em',
          }}>
            ꌗꀘꀤ꒒꒒ꌃꀎꈤ
          </span>
        </div>

        <h2 style={{
          color: 'var(--text)',
          fontSize: '1.6rem',
          marginBottom: '0.75rem',
          fontFamily: 'var(--font-fredoka), cursive',
        }}>
          Something hopped off track
        </h2>

        <p style={{
          color: 'var(--subtle-text, var(--muted))',
          marginBottom: '1.75rem',
          lineHeight: '1.6',
          fontSize: '0.95rem',
          fontFamily: 'var(--font-nunito), sans-serif',
        }}>
          {errorMessage}
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--green)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontFamily: 'var(--font-nunito), sans-serif',
              transition: 'transform 0.15s ease, opacity 0.15s ease',
            }}
          >
            Try Again
          </button>
          <Link
            href="/"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontFamily: 'var(--font-nunito), sans-serif',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
