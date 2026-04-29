'use client';

import { useSyncExternalStore } from 'react';

const PROFILE_CHANGE_EVENT = 'sb_profile_change';
const DEFAULT_PROFILE = Object.freeze({
  hydrated: false,
  name: 'Student',
  hasName: false,
  degree: '',
  year: '',
});
let lastSnapshot = DEFAULT_PROFILE;

function readProfileSnapshot() {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE;
  }

  let nextSnapshot;
  try {
    const storedName = window.localStorage.getItem('sb_name') || '';
    nextSnapshot = {
      hydrated: true,
      name: storedName || 'Student',
      hasName: Boolean(storedName),
      degree: window.localStorage.getItem('sb_degree') || '',
      year: window.localStorage.getItem('sb_year') || '',
    };
  } catch {
    nextSnapshot = { ...DEFAULT_PROFILE, hydrated: true };
  }

  if (
    lastSnapshot.hydrated === nextSnapshot.hydrated &&
    lastSnapshot.name === nextSnapshot.name &&
    lastSnapshot.hasName === nextSnapshot.hasName &&
    lastSnapshot.degree === nextSnapshot.degree &&
    lastSnapshot.year === nextSnapshot.year
  ) {
    return lastSnapshot;
  }

  lastSnapshot = nextSnapshot;
  return lastSnapshot;
}

function subscribeToProfile(onStoreChange) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event) => {
    if (!event.key || event.key.startsWith('sb_')) {
      onStoreChange();
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(PROFILE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(PROFILE_CHANGE_EVENT, onStoreChange);
  };
}

export function useStoredProfile() {
  return useSyncExternalStore(subscribeToProfile, readProfileSnapshot, () => DEFAULT_PROFILE);
}

export function saveStoredProfile({ name, degree, year }) {
  window.localStorage.setItem('sb_name', name || 'Student');
  window.localStorage.setItem('sb_degree', degree);
  window.localStorage.setItem('sb_year', year);
  window.dispatchEvent(new Event(PROFILE_CHANGE_EVENT));
}
