'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const supabase = createClient();
  const router = useRouter();
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
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('sb_name');
    localStorage.removeItem('sb_email');
    localStorage.removeItem('sb_degree');
    localStorage.removeItem('sb_year');
    localStorage.removeItem('sb_human_proof');
    router.push('/');
    router.refresh();
  };

  const toggleMobileMenu = () => {
    const btn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    if (btn) btn.classList.toggle('active');
    if (navLinks) {
      navLinks.classList.toggle('active');
      navLinks.querySelectorAll('a').forEach(link => {
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

  // Loading state
  if (loading) {
    return mobileMenuButton;
  }

  // Not logged in — show "Get Started" + mobile menu
  if (!user) {
    return (
      <div className="mobile-dropdown-group">
        <a href="/quiz" className="btn-signup">Get Started 🚀</a>
        {mobileMenuButton}
      </div>
    );
  }

  // Logged in — show profile pill with name + avatar + dropdown
  const name = user.user_metadata?.full_name || 'User';
  const firstName = name.split(' ')[0];
  const avatar = user.user_metadata?.avatar_url;
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="mobile-dropdown-group">
      <div className="user-menu-wrapper">
        <button className="user-profile-pill" onClick={() => setOpen(!open)} title={`Logged in as ${name}`}>
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

        {open && (
          <>
            <div className="user-menu-backdrop" onClick={() => setOpen(false)} />
            <div className="user-menu-dropdown">
              <div className="user-menu-info">
                <strong>{name}</strong>
                <span>{user.email}</span>
              </div>
              <div className="user-menu-divider" />
              <a href="/quiz" className="user-menu-item" onClick={() => setOpen(false)}>🎯 Career Quiz</a>
              <a href="/counsellor" className="user-menu-item" onClick={() => setOpen(false)}>🤖 AI Counsellor</a>
              <div className="user-menu-divider" />
              <button className="user-menu-item user-menu-logout" onClick={handleLogout}>🚪 Logout</button>
            </div>
          </>
        )}
      </div>
      {mobileMenuButton}
    </div>
  );
}
