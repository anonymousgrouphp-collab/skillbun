'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useStoredProfile } from '@/utils/shared/profileStore';

const GUEST_ITEMS = [
  { href: '/onboarding?next=/dashboard', label: 'Log In', icon: 'login' },
  { href: '/onboarding?next=/dashboard', label: 'Sign Up', icon: 'signup' },
  { href: '/onboarding?next=/quiz', label: 'Get Started', icon: 'spark' },
];

const INCOMPLETE_PROFILE_ITEMS = [
  { href: '/onboarding?next=/dashboard', label: 'Complete Profile', icon: 'profile' },
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: 'mailto:harsh@skillbun.tech', label: 'Support Center', icon: 'support', external: true },
];

const COMPLETE_PROFILE_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/onboarding?next=/dashboard', label: 'Profile Settings', icon: 'profile' },
  { href: '/dashboard', label: 'Learning Progress', icon: 'progress' },
  { href: '/dashboard', label: 'Saved Paths', icon: 'saved' },
  { href: 'mailto:harsh@skillbun.tech', label: 'Support Center', icon: 'support', external: true },
];

function MenuIcon({ name }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const icons = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="8" rx="2" />
        <rect x="14" y="3" width="7" height="5" rx="2" />
        <rect x="14" y="12" width="7" height="9" rx="2" />
        <rect x="3" y="15" width="7" height="6" rx="2" />
      </>
    ),
    profile: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    progress: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 4-4 3 3 5-7" />
      </>
    ),
    saved: <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />,
    support: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.8 2.8 0 0 1 5 1.8c0 2-2.5 2-2.5 4" />
        <path d="M12 18h.01" />
      </>
    ),
    login: (
      <>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <path d="m10 17 5-5-5-5" />
        <path d="M15 12H3" />
      </>
    ),
    signup: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6" />
        <path d="M22 11h-6" />
      </>
    ),
    spark: <path d="M13 2 9 10l-7 3 7 3 4 8 4-8 7-3-7-3-4-8Z" />,
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      </>
    ),
  };

  return <svg className="user-menu-icon" {...commonProps}>{icons[name]}</svg>;
}

function MenuLink({ item, onSelect }) {
  const content = (
    <>
      <MenuIcon name={item.icon} />
      <span>{item.label}</span>
    </>
  );

  if (item.external) {
    return (
      <a href={item.href} className="user-menu-item" role="menuitem" onClick={onSelect}>
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} className="user-menu-item" role="menuitem" onClick={onSelect}>
      {content}
    </Link>
  );
}

export default function UserMenu() {
  const menuRef = useRef(null);
  const profile = useStoredProfile();
  const [accountOpen, setAccountOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

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

  if (!profile.hydrated) {
    return siteMenuButton;
  }

  if (!profile.hasName) {
    return (
      <div className="mobile-dropdown-group user-menu-shell">
        <div className="user-menu-wrapper" ref={menuRef}>
          <button
            className={`user-profile-pill user-profile-pill-guest ${accountOpen ? 'is-open' : ''}`}
            onClick={toggleAccountMenu}
            aria-expanded={accountOpen}
            aria-haspopup="menu"
            title="Open account menu"
          >
            <span className="user-pill-avatar">
              <span className="user-pill-initials">SB</span>
            </span>
            <span className="user-pill-name">Account</span>
            <svg className={`user-pill-chevron ${accountOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {accountOpen && (
            <div className="user-menu-dropdown user-menu-dropdown-guest" role="menu" onClick={(event) => event.stopPropagation()}>
              <div className="user-menu-heading">
                <span className="user-menu-heading-title">Welcome to SkillBun</span>
                <span className="user-menu-heading-meta">Start your career guidance profile.</span>
              </div>
              <div className="user-menu-list">
                {GUEST_ITEMS.map((item) => (
                  <MenuLink key={item.label} item={item} onSelect={() => setAccountOpen(false)} />
                ))}
              </div>
            </div>
          )}
        </div>
        {siteMenuButton}
      </div>
    );
  }

  const firstName = profile.name.split(' ')[0];
  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const isProfileComplete = Boolean(profile.degree && profile.year);
  const accountItems = isProfileComplete ? COMPLETE_PROFILE_ITEMS : INCOMPLETE_PROFILE_ITEMS;

  return (
    <div className="mobile-dropdown-group user-menu-shell user-menu-shell-authenticated">
      <div className="user-menu-wrapper" ref={menuRef}>
        <button
          className={`user-profile-pill user-profile-pill-split ${accountOpen ? 'is-open' : ''}`}
          onClick={toggleAccountMenu}
          aria-expanded={accountOpen}
          aria-haspopup="menu"
          title={`Logged in as ${profile.name}`}
        >
          <span className="user-pill-avatar">
            <span className="user-pill-initials">{initials}</span>
          </span>
          <span className="user-pill-name">{firstName}</span>
          <svg className={`user-pill-chevron ${accountOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {accountOpen && (
          <div className="user-menu-dropdown" role="menu" onClick={(event) => event.stopPropagation()}>
            <div className="user-menu-heading user-menu-heading-auth">
              <span className="user-menu-heading-avatar">{initials}</span>
              <span className="user-menu-heading-copy">
                <span className="user-menu-heading-title">{profile.name}</span>
                <span className="user-menu-heading-meta">
                  {isProfileComplete ? 'Student Account' : 'Profile setup needed'}
                </span>
              </span>
            </div>

            <div className="user-menu-list">
              {accountItems.map((item) => (
                <MenuLink key={item.label} item={item} onSelect={() => setAccountOpen(false)} />
              ))}
            </div>

            <div className="user-menu-divider" />

            <button
              className="user-menu-item user-menu-signout"
              onClick={handleLogout}
              disabled={signingOut}
              role="menuitem"
            >
              <MenuIcon name="logout" />
              <span>{signingOut ? 'Signing out...' : 'Log Out'}</span>
            </button>
          </div>
        )}
      </div>
      {siteMenuButton}
    </div>
  );
}
