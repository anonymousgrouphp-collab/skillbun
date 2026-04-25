'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import { createClient } from '@/utils/supabase/client';

const MENU_ITEMS = [
  { href: '/profile', label: 'Profile' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/roadmaps', label: 'Saved Roadmaps' },
  { href: '/support', label: 'Help & Support' },
];

export default function UserMenu() {
  const menuRef = useRef(null);
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function syncUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      setUser(user);
      setLoading(false);
    }

    syncUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!accountOpen) {
      return;
    }

    const handleClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setAccountOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [accountOpen]);

  const closeNavMenu = () => {
    const button = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    button?.classList.remove('active');
    navLinks?.classList.remove('active');
    setNavOpen(false);
  };

  const toggleNavMenu = () => {
    const button = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    if (!button || !navLinks) {
      return;
    }

    const nextOpen = !navLinks.classList.contains('active');
    button.classList.toggle('active', nextOpen);
    navLinks.classList.toggle('active', nextOpen);
    setNavOpen(nextOpen);
    setAccountOpen(false);

    navLinks.querySelectorAll('a').forEach((link) => {
      link.onclick = () => {
        closeNavMenu();
      };
    });
  };

  const handleLogout = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    setSigningOut(true);
    setAccountOpen(false);
    closeNavMenu();

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Signout error:', error);
    }

    localStorage.removeItem('sb_name');
    localStorage.removeItem('sb_email');
    localStorage.removeItem('sb_degree');
    localStorage.removeItem('sb_year');
    localStorage.removeItem('sb_counsel_rl');
    localStorage.removeItem('sb_human_proof');
    localStorage.removeItem('sb_dest');
    window.location.assign('/');
  };

  const toggleAccountMenu = (event) => {
    event.stopPropagation();
    setAccountOpen((current) => !current);
    closeNavMenu();
  };

  const siteMenuButton = (
    <button
      className={`mobile-menu-btn user-site-menu-btn ${navOpen ? 'active' : ''}`}
      id="mobileMenuBtn"
      aria-label="Toggle navigation menu"
      aria-expanded={navOpen}
      onClick={toggleNavMenu}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="7" x2="20" y2="7"></line>
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <line x1="4" y1="17" x2="20" y2="17"></line>
      </svg>
    </button>
  );

  if (loading) {
    return siteMenuButton;
  }

  if (!user) {
    return (
      <div className="mobile-dropdown-group user-menu-shell">
        <Link href="/quiz" className="btn-signup">Get Started</Link>
        {siteMenuButton}
      </div>
    );
  }

  const name = user.user_metadata?.full_name || 'User';
  const firstName = name.split(' ')[0];
  const avatar = user.user_metadata?.avatar_url;
  const email = user.email;
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const MOBILE_ONLY_ITEMS = [
    { href: '/#features', label: 'Features' },
    { href: '/#how', label: 'How it Works' },
    { href: '/#careers', label: 'Career Paths' },
    { href: '/counsellor', label: 'AI Counsellor' },
    { href: '/#contact', label: 'Connect with us' },
  ];

  return (
    <div className="mobile-dropdown-group user-menu-shell user-menu-shell-authenticated">
      <div className="user-menu-wrapper" ref={menuRef}>
        <button
          className="user-profile-pill user-profile-pill-split"
          onClick={toggleAccountMenu}
          aria-expanded={accountOpen}
          aria-haspopup="menu"
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
          <svg className={`user-pill-chevron ${accountOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {accountOpen && (
          <div className="user-menu-dropdown" role="menu" onClick={(event) => event.stopPropagation()}>
            {MOBILE_ONLY_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="user-menu-item mobile-nav-item"
                role="menuitem"
                onClick={() => setAccountOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {MOBILE_ONLY_ITEMS.length > 0 && <div className="user-menu-divider mobile-nav-item" />}

            {MENU_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="user-menu-item"
                role="menuitem"
                onClick={() => setAccountOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            <button
              className="user-menu-item user-menu-signout"
              onClick={handleLogout}
              disabled={signingOut}
              role="menuitem"
            >
              {signingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
