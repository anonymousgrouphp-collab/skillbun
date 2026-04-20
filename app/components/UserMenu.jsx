'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
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
    router.push('/');
    router.refresh();
  };

  if (!user) return null;

  const name = user.user_metadata?.full_name || 'User';
  const avatar = user.user_metadata?.avatar_url;
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="user-menu-wrapper" style={{ position: 'relative' }}>
      <button className="user-avatar-btn" onClick={() => setOpen(!open)} title={name}>
        {avatar ? (
          <img src={avatar} alt={name} className="user-avatar-img" referrerPolicy="no-referrer" />
        ) : (
          <span className="user-avatar-initials">{initials}</span>
        )}
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
  );
}
