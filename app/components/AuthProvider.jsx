'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { getFirebaseServices } from '@/utils/client/firebaseClient';
import { clearStoredProfile, notifyProfileChanged, readProfileSnapshot, saveStoredProfile } from '@/utils/shared/profileStore';
import {
  clearStoredRoadmapProgress,
  readAllStoredRoadmapProgress,
  saveStoredRoadmapProgress,
} from '@/utils/shared/progressStore';

const AuthContext = createContext(null);

function getProviders(user) {
  return user?.providerData?.map((provider) => provider.providerId).filter(Boolean) || [];
}

function fallbackNameFromUser(user) {
  if (user?.displayName?.trim()) {
    return user.displayName.trim();
  }

  if (user?.email?.includes('@')) {
    return user.email.split('@')[0];
  }

  return '';
}

function normalizeProfileDoc(user, data = {}) {
  const name = String(data.name || data.fullName || fallbackNameFromUser(user) || '').trim();

  return {
    hydrated: true,
    uid: user?.uid || '',
    email: data.email || user?.email || '',
    displayName: data.displayName || user?.displayName || '',
    photoURL: data.photoURL || user?.photoURL || '',
    name: name || 'Student',
    hasName: Boolean(name),
    degree: data.degree || '',
    year: data.year || data.current_year || '',
    interest: data.interest || data.interest_area || '',
    emailVerified: Boolean(user?.emailVerified || data.emailVerified),
    providers: Array.isArray(data.providers) ? data.providers : getProviders(user),
  };
}

function localProfileForMigration(user) {
  const localProfile = readProfileSnapshot();
  const name = localProfile.hasName ? localProfile.name : fallbackNameFromUser(user);

  return {
    name: name || '',
    degree: localProfile.degree || '',
    year: localProfile.year || '',
    interest: localProfile.interest || '',
  };
}

function profileNeedsSetup(profile) {
  return !profile?.degree || !profile?.year;
}

async function ensureUserProfile(db, user) {
  const profileRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(profileRef);
  const localProfile = localProfileForMigration(user);
  const existing = snapshot.exists() ? snapshot.data() : {};

  const profilePatch = {
    uid: user.uid,
    email: user.email || existing.email || '',
    displayName: user.displayName || existing.displayName || '',
    photoURL: user.photoURL || existing.photoURL || '',
    emailVerified: Boolean(user.emailVerified),
    providers: getProviders(user),
    updatedAt: serverTimestamp(),
  };

  if (!snapshot.exists()) {
    Object.assign(profilePatch, {
      name: localProfile.name || fallbackNameFromUser(user) || '',
      degree: localProfile.degree || '',
      year: localProfile.year || '',
      interest: localProfile.interest || '',
      createdAt: serverTimestamp(),
    });
  } else {
    if (!existing.name && localProfile.name) profilePatch.name = localProfile.name;
    if (!existing.degree && localProfile.degree) profilePatch.degree = localProfile.degree;
    if (!existing.year && localProfile.year) profilePatch.year = localProfile.year;
    if (!existing.interest && localProfile.interest) profilePatch.interest = localProfile.interest;
  }

  await setDoc(profileRef, profilePatch, { merge: true });
}

async function migrateLocalProgress(db, user) {
  const localProgress = readAllStoredRoadmapProgress();

  await Promise.all(localProgress.map(async ({ slug, completedNodeIds }) => {
    if (!slug || completedNodeIds.length === 0) {
      return;
    }

    const progressRef = doc(db, 'users', user.uid, 'roadmapProgress', slug);
    const snapshot = await getDoc(progressRef);
    const remoteIds = snapshot.exists() && Array.isArray(snapshot.data().completedNodeIds)
      ? snapshot.data().completedNodeIds.filter((item) => typeof item === 'string')
      : [];
    const mergedIds = Array.from(new Set([...remoteIds, ...completedNodeIds]));

    if (!snapshot.exists() || mergedIds.length !== remoteIds.length) {
      await setDoc(progressRef, {
        slug,
        completedNodeIds: mergedIds,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  }));
}

function clearSessionCache() {
  clearStoredProfile();
  clearStoredRoadmapProgress();
  window.localStorage.removeItem('sb_counsel_rl');
  window.localStorage.removeItem('sb_human_proof');
  window.localStorage.removeItem('sb_dest');
  window.localStorage.removeItem('sb_last_xp');
}

function assertRecentSignIn(user) {
  const lastSignInTime = user?.metadata?.lastSignInTime ? Date.parse(user.metadata.lastSignInTime) : 0;
  const signedInRecently = lastSignInTime && Date.now() - lastSignInTime < 2 * 60 * 1000;

  if (!signedInRecently) {
    const error = new Error('Please log out and log back in before deleting your account.');
    error.code = 'auth/requires-recent-login';
    throw error;
  }
}

export function AuthProvider({ children }) {
  const services = useMemo(() => getFirebaseServices(), []);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(() => ({
    hydrated: !services.configured,
    name: 'Student',
    hasName: false,
    degree: '',
    year: '',
    interest: '',
  }));
  const [authLoading, setAuthLoading] = useState(services.configured);
  const [profileLoading, setProfileLoading] = useState(false);
  const [progressVersion, setProgressVersion] = useState(0);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!services.configured) {
      return undefined;
    }

    let profileUnsubscribe = null;
    let progressUnsubscribe = null;
    let cancelled = false;

    const unsubscribeAuth = onAuthStateChanged(services.auth, async (nextUser) => {
      profileUnsubscribe?.();
      progressUnsubscribe?.();
      profileUnsubscribe = null;
      progressUnsubscribe = null;

      setAuthError('');
      setUser(nextUser);
      setAuthLoading(false);

      if (!nextUser) {
        setProfile({ hydrated: true, name: 'Student', hasName: false, degree: '', year: '', interest: '' });
        setProfileLoading(false);
        setProgressVersion((current) => current + 1);
        return;
      }

      setProfileLoading(true);

      try {
        await ensureUserProfile(services.db, nextUser);
        await migrateLocalProgress(services.db, nextUser);

        if (cancelled) {
          return;
        }

        const profileRef = doc(services.db, 'users', nextUser.uid);
        profileUnsubscribe = onSnapshot(profileRef, (snapshot) => {
          const normalized = normalizeProfileDoc(nextUser, snapshot.exists() ? snapshot.data() : {});
          setProfile(normalized);
          saveStoredProfile(normalized);
          setProfileLoading(false);
        }, (error) => {
          console.error('Failed to read Firebase profile:', error);
          const fallbackProfile = normalizeProfileDoc(nextUser);
          setProfile(fallbackProfile);
          saveStoredProfile(fallbackProfile);
          setAuthError('Could not load your cloud profile. Local cached profile is being used for now.');
          setProfileLoading(false);
        });

        const progressRef = collection(services.db, 'users', nextUser.uid, 'roadmapProgress');
        progressUnsubscribe = onSnapshot(progressRef, (snapshot) => {
          snapshot.forEach((progressDoc) => {
            const data = progressDoc.data();
            const slug = data.slug || progressDoc.id;
            const completedNodeIds = Array.isArray(data.completedNodeIds)
              ? data.completedNodeIds.filter((item) => typeof item === 'string')
              : [];

            saveStoredRoadmapProgress(slug, completedNodeIds);
          });
          setProgressVersion((current) => current + 1);
        }, (error) => {
          console.error('Failed to read Firebase roadmap progress:', error);
          setAuthError('Could not sync roadmap progress from Firestore.');
        });
      } catch (error) {
        console.error('Failed to initialize Firebase profile:', error);
        const fallbackProfile = normalizeProfileDoc(nextUser);
        setProfile(fallbackProfile);
        saveStoredProfile(fallbackProfile);
        setAuthError('Could not initialize your Firebase profile. Check your Firebase project settings.');
        setProfileLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribeAuth();
      profileUnsubscribe?.();
      progressUnsubscribe?.();
    };
  }, [services]);

  const signInWithGoogle = useCallback(async () => {
    if (!services.configured) {
      throw new Error('Firebase is not configured yet.');
    }

    return signInWithPopup(services.auth, services.googleProvider);
  }, [services]);

  const signUpWithEmail = useCallback(async (email, password) => {
    if (!services.configured) {
      throw new Error('Firebase is not configured yet.');
    }

    const credential = await createUserWithEmailAndPassword(services.auth, email, password);

    try {
      await sendEmailVerification(credential.user);
    } catch (error) {
      console.warn('Could not send verification email:', error);
    }

    return credential;
  }, [services]);

  const signInWithEmail = useCallback(async (email, password) => {
    if (!services.configured) {
      throw new Error('Firebase is not configured yet.');
    }

    return signInWithEmailAndPassword(services.auth, email, password);
  }, [services]);

  const resetPassword = useCallback(async (email) => {
    const response = await fetch('/api/auth/password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data?.error || 'Could not send password reset email.');
      error.code = response.status === 429 ? 'auth/too-many-requests' : 'auth/password-reset-failed';
      error.retryAfterMs = data?.retryAfterMs || 0;
      throw error;
    }

    return data;
  }, []);

  const resendVerification = useCallback(async () => {
    if (!services.configured || !services.auth.currentUser) {
      throw new Error('Sign in before requesting a verification email.');
    }

    return sendEmailVerification(services.auth.currentUser);
  }, [services]);

  const saveProfile = useCallback(async ({ name, degree, year, interest }) => {
    if (!services.configured || !services.auth.currentUser) {
      throw new Error('Sign in before saving your SkillBun profile.');
    }

    const currentUser = services.auth.currentUser;
    const nextProfile = {
      uid: currentUser.uid,
      email: currentUser.email || '',
      displayName: currentUser.displayName || '',
      photoURL: currentUser.photoURL || '',
      name: name || fallbackNameFromUser(currentUser) || 'Student',
      degree: degree || '',
      year: year || '',
      interest: interest || '',
      emailVerified: Boolean(currentUser.emailVerified),
      providers: getProviders(currentUser),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(services.db, 'users', currentUser.uid), nextProfile, { merge: true });
    saveStoredProfile(nextProfile);
  }, [services]);

  const saveRoadmapProgress = useCallback(async (slug, completedNodeIds) => {
    const cleanIds = Array.from(new Set((completedNodeIds || []).filter((item) => typeof item === 'string')));

    if (!services.configured || !services.auth.currentUser) {
      throw new Error('Sign in before saving roadmap progress.');
    }

    await setDoc(doc(services.db, 'users', services.auth.currentUser.uid, 'roadmapProgress', slug), {
      slug,
      completedNodeIds: cleanIds,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    saveStoredRoadmapProgress(slug, cleanIds);
  }, [services]);

  const signOutUser = useCallback(async () => {
    if (services.configured) {
      await signOut(services.auth);
    }

    clearSessionCache();
    notifyProfileChanged();
  }, [services]);

  const deleteAccount = useCallback(async () => {
    if (!services.configured || !services.auth.currentUser) {
      throw new Error('Sign in before deleting your SkillBun account.');
    }

    const currentUser = services.auth.currentUser;
    assertRecentSignIn(currentUser);

    const progressSnapshot = await getDocs(collection(services.db, 'users', currentUser.uid, 'roadmapProgress'));
    await Promise.all(progressSnapshot.docs.map((progressDoc) => deleteDoc(progressDoc.ref)));
    await deleteDoc(doc(services.db, 'users', currentUser.uid));
    await deleteUser(currentUser);
    clearSessionCache();
    notifyProfileChanged();
  }, [services]);

  const value = useMemo(() => ({
    configured: services.configured,
    user,
    profile,
    authLoading,
    profileLoading,
    authError,
    progressVersion,
    isAuthenticated: Boolean(user),
    isProfileComplete: Boolean(user && !profileNeedsSetup(profile)),
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    resendVerification,
    saveProfile,
    saveRoadmapProgress,
    signOutUser,
    deleteAccount,
  }), [
    services.configured,
    user,
    profile,
    authLoading,
    profileLoading,
    authError,
    progressVersion,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    resendVerification,
    saveProfile,
    saveRoadmapProgress,
    signOutUser,
    deleteAccount,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return value;
}
