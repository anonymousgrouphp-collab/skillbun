'use client';

import { useState, useEffect } from 'react';
import { getFirebaseServices } from '@/utils/client/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Validates if the authenticated user is the Founder Master Admin.
 * STRICT REQUIREMENT: Must be harsh@skillbun.tech AND authenticated via Google Login.
 * @param {Object} user - Firebase User object
 * @returns {boolean}
 */
export function checkIsFounderAdmin(user) {
  if (!user || !user.email) return false;
  const email = user.email.trim().toLowerCase();
  const isGoogleLogin = Array.isArray(user.providerData) &&
    user.providerData.some((p) => p.providerId === 'google.com');

  return email === 'harsh@skillbun.tech' && isGoogleLogin;
}

/**
 * Unified React hook for Admin RBAC validation across all /admin pages.
 * Flow:
 * 1. Check if harsh@skillbun.tech (Google Login) -> Founder Master Admin (Instant access).
 * 2. Check if user exists in Firestore `/admins/{email}` with active: true -> Authorized Admin / HR.
 * 3. Otherwise -> Normal Student (Access Denied to /admin).
 *
 * @param {Object} user - Firebase User object
 * @param {boolean} authLoading - Auth loading state
 * @returns {{ isAdmin: boolean, isFounder: boolean, role: string|null, checking: boolean }}
 */
export function useAdminAccess(user, authLoading) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFounder, setIsFounder] = useState(false);
  const [role, setRole] = useState(null); // 'founder' | 'admin' | 'hr' | null
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function verify() {
      if (authLoading) return;
      if (!user || !user.email) {
        if (isMounted) {
          setIsAdmin(false);
          setIsFounder(false);
          setRole(null);
          setChecking(false);
        }
        return;
      }

      // Check 1: Founder Master Admin (harsh@skillbun.tech with Google Login)
      if (checkIsFounderAdmin(user)) {
        if (isMounted) {
          setIsAdmin(true);
          setIsFounder(true);
          setRole('founder');
          setChecking(false);
        }
        return;
      }

      // Check 2: Database lookup in Firestore /admins/{email}
      try {
        const { db } = getFirebaseServices();
        if (db) {
          const email = user.email.trim().toLowerCase();
          const adminDoc = await getDoc(doc(db, 'admins', email));
          if (adminDoc.exists()) {
            const data = adminDoc.data();
            if (data?.active !== false) {
              if (isMounted) {
                setIsAdmin(true);
                setIsFounder(false);
                setRole(data?.role || 'admin');
                setChecking(false);
              }
              return;
            }
          }
        }
      } catch (err) {
        console.error('[Admin Verification Check Error]', err);
      }

      if (isMounted) {
        setIsAdmin(false);
        setIsFounder(false);
        setRole(null);
        setChecking(false);
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  return { isAdmin, isFounder, role, checking };
}
