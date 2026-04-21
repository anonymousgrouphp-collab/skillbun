'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function UserMenu() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      if (!e.target.closest('.user-menu-wrapper')) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
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

  const mobileMenuButton = (
    <button className="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu" onClick={toggleMobileMenu}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  );

  if (loading) {
    return mobileMenuButton;
  }

  if (!user) {
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
  const initials = name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setOpen(!open);
  };

  return (
    <div className="mobile-dropdown-group user-menu-wrapper">
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
        aria-label="Toggle user menu"
        onClick={toggleUserMenu}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {open && (
        <div className="user-menu-dropdown" onClick={(e) => e.stopPropagation()}>
          <div className="user-menu-info">
            <strong>{name}</strong>
            <span>{user.email}</span>
          </div>

          <div className="user-menu-nav-group">
            <div className="user-menu-divider" />
            <Link href="/#features" className="user-menu-item" onClick={() => setOpen(false)}>✨ Features</Link>
            <Link href="/#how" className="user-menu-item" onClick={() => setOpen(false)}>🐾 How it Works</Link>
            <Link href="/#careers" className="user-menu-item" onClick={() => setOpen(false)}>🚀 Career Paths</Link>
            <Link href="/#contact" className="user-menu-item" onClick={() => setOpen(false)}>📬 Connect with us</Link>
          </div>

          <div className="user-menu-divider" />
          <Link href="/quiz" className="user-menu-item" onClick={() => setOpen(false)}>🎯 Career Quiz</Link>
          <Link href="/counsellor" className="user-menu-item" onClick={() => setOpen(false)}>🤖 AI Counsellor</Link>
          <div className="user-menu-divider" />
          <button className="user-menu-item user-menu-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}
