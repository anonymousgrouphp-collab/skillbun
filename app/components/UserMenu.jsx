'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

const COMPACT_BREAKPOINT = '(max-width: 1400px)';

const NAV_ITEMS = [
  { href: '/#features', label: 'Features' },
  { href: '/#how', label: 'How it Works' },
  { href: '/#careers', label: 'Career Paths' },
  { href: '/#contact', label: 'Connect with us' },
];

const ACCOUNT_ITEMS = [
  { href: '/quiz', label: 'Career Quiz' },
  { href: '/counsellor', label: 'AI Counsellor' },
];

export default function UserMenu() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(COMPACT_BREAKPOINT);
    const update = () => setIsCompact(media.matches);
    update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      if (!e.target.closest('.user-menu-wrapper')) {
        setOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Signout error:', err);
    }

    localStorage.removeItem('sb_name');
    localStorage.removeItem('sb_email');
    localStorage.removeItem('sb_degree');
    localStorage.removeItem('sb_year');
    localStorage.removeItem('sb_counsel_rl');
    localStorage.removeItem('sb_human_proof');
    window.location.href = '/';
  };

  const toggleMobileMenu = () => {
    const btn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    if (btn) btn.classList.toggle('active');
    if (navLinks) {
      navLinks.classList.toggle('active');
      navLinks.querySelectorAll('a').forEach((link) => {
        link.onclick = () => {
          btn?.classList.remove('active');
          navLinks.classList.remove('active');
        };
      });
    }
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setOpen((current) => !current);
  };

  const mobileMenuButton = (
    <button className="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle navigation menu" onClick={toggleMobileMenu}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  );

  if (loading) {
    return isCompact ? mobileMenuButton : null;
  }

  if (!user) {
    if (!isCompact) {
      return <Link href="/quiz" className="btn-signup">Get Started 🚀</Link>;
    }

    return (
      <div className="mobile-dropdown-group">
        <Link href="/quiz" className="btn-signup">Get Started 🚀</Link>
        {mobileMenuButton}
      </div>
    );
  }

  const name = user.user_metadata?.full_name || 'User';
  const firstName = name.split(' ')[0];
  const avatar = user.user_metadata?.avatar_url;
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`user-menu-wrapper${isCompact ? ' user-menu-wrapper-compact' : ''}`}>
      {isCompact ? (
        <>
          <button
            className="user-profile-pill user-profile-pill-split"
            onClick={toggleUserMenu}
            title={`Logged in as ${name}`}
          >
            <span className="user-pill-avatar">
              {avatar ? (
                <img src={avatar} alt={name} referrerPolicy="no-referrer" />
              ) : (
                <span className="user-pill-initials">{initials}</span>
              )}
            </span>
            <span className="user-pill-name">{firstName}</span>
          </button>

          <button
            className={`mobile-menu-btn user-menu-trigger ${open ? 'active' : ''}`}
            aria-label="Toggle account menu"
            onClick={toggleUserMenu}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </>
      ) : (
        <button
          className="user-profile-pill"
          onClick={toggleUserMenu}
          title={`Logged in as ${name}`}
        >
          <span className="user-pill-avatar">
            {avatar ? (
              <img src={avatar} alt={name} referrerPolicy="no-referrer" />
            ) : (
              <span className="user-pill-initials">{initials}</span>
            )}
          </span>
          <span className="user-pill-name">{firstName}</span>
          <svg className={`user-pill-chevron ${open ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      )}

      {open && (
        <div className={`user-menu-dropdown${isCompact ? ' user-menu-dropdown-compact' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="user-menu-info">
            <strong>{name}</strong>
            <span>{user.email}</span>
          </div>

          {isCompact && (
            <div className="user-menu-nav-group">
              <div className="user-menu-divider" />
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className="user-menu-item" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          <div className="user-menu-divider" />
          {ACCOUNT_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="user-menu-item" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <div className="user-menu-divider" />
          <button className="user-menu-item user-menu-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
