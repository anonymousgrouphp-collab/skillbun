'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    if (error) {
      console.error('[SkillBun Root Global Error Caught]:', error)
    }
  }, [error])

  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#0a0d12',
        color: '#f0f6fc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          padding: '2.5rem 2rem',
          backgroundColor: '#161b22',
          borderRadius: '16px',
          border: '1px solid #30363d',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        }}>
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
              width={44}
              height={44}
              style={{ objectFit: 'contain' }}
            />
            <span style={{
              color: '#38bdf8',
              fontSize: '1.4rem',
              fontWeight: '700',
              letterSpacing: '0.02em',
            }}>
              ꌗꀘꀤ꒒꒒ꌃꀎꈤ
            </span>
          </div>

          <h1 style={{
            fontSize: '1.5rem',
            margin: '0 0 0.75rem 0',
            color: '#f0f6fc',
          }}>
            Critical System Encounter
          </h1>

          <p style={{
            color: '#8b949e',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            marginBottom: '2rem',
          }}>
            An unexpected error occurred while loading the application.
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
                backgroundColor: '#238636',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
              }}
            >
              Try Again
            </button>
            <Link
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#f0f6fc',
                border: '1px solid #30363d',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
