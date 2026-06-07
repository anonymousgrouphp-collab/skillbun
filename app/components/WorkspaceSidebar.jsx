import Link from 'next/link';
import styles from './WorkspaceSidebar.module.css';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { key: 'quiz', label: 'Career Quiz', href: '/quiz', icon: 'quiz' },
  { key: 'roadmaps', label: 'Roadmaps', href: '/roadmap', icon: 'map' },
  { key: 'profile', label: 'Profile', href: '/onboarding?edit=1', icon: 'user' },
  { key: 'settings', label: 'Settings', href: '/settings', icon: 'settings' },
  { key: 'help', label: 'Help', href: '/contact', icon: 'help' },
];

function WorkspaceIcon({ name }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    quiz: (
      <>
        <path d="M9.5 9a2.5 2.5 0 1 1 4.1 1.9c-.9.7-1.6 1.2-1.6 2.6" />
        <path d="M12 17h.01" />
        <rect x="5" y="3" width="14" height="18" rx="2" />
      </>
    ),
    map: (
      <>
        <path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
        <path d="M9 3v15" />
        <path d="M15 6v15" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M4.2 4.2l2.1 2.1" />
        <path d="M17.7 17.7l2.1 2.1" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
        <path d="M4.2 19.8l2.1-2.1" />
        <path d="M17.7 6.3l2.1-2.1" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4.1 1.9c-.9.7-1.6 1.2-1.6 2.6" />
        <path d="M12 17h.01" />
      </>
    ),
  };

  return <svg className={styles.icon} {...commonProps}>{paths[name]}</svg>;
}

export default function WorkspaceSidebar({
  active,
  title = 'Student Progress',
  kicker = 'SkillBun Workspace',
  status = 'DASHBOARD.ONLINE',
}) {
  return (
    <aside className={`${styles.sidebar} ${styles.glassPanel}`} aria-label="Workspace navigation">
      <span className={styles.glowBadge}>{status}</span>
      <p className={styles.sidebarKicker}>{kicker}</p>
      <h1 className={styles.sidebarTitle}>{title}</h1>
      <div className={styles.sideNav} role="navigation" aria-label="Workspace links">
        {navItems.map((item) => {
          const isActive = active === item.key;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <WorkspaceIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
