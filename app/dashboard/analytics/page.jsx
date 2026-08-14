'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeprecatedDashboardAnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect seamlessly to the new unified Admin Analytics route
    router.replace('/admin/analytics');
  }, [router]);

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '2.5rem' }}>🔄</div>
      <p style={{ color: 'var(--muted)', fontSize: '1rem' }}>Redirecting to Unified Admin Console...</p>
    </div>
  );
}
