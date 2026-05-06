'use client';

import { useSyncExternalStore } from 'react';

const PROFILE_CHANGE_EVENT = 'sb_profile_change';
const DEFAULT_PROFILE = Object.freeze({
  hydrated: false,
  name: 'Student',
  hasName: false,
  email: '',
  degree: '',
  year: '',
  interest: '',
});
let lastSnapshot = DEFAULT_PROFILE;

export function notifyProfileChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(PROFILE_CHANGE_EVENT));
  }
}

export function readProfileSnapshot() {
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
      email: window.localStorage.getItem('sb_email') || '',
      degree: window.localStorage.getItem('sb_degree') || '',
      year: window.localStorage.getItem('sb_year') || '',
      interest: window.localStorage.getItem('sb_interest') || '',
    };
  } catch {
    nextSnapshot = { ...DEFAULT_PROFILE, hydrated: true };
  }

  if (
    lastSnapshot.hydrated === nextSnapshot.hydrated &&
    lastSnapshot.name === nextSnapshot.name &&
    lastSnapshot.hasName === nextSnapshot.hasName &&
    lastSnapshot.email === nextSnapshot.email &&
    lastSnapshot.degree === nextSnapshot.degree &&
    lastSnapshot.year === nextSnapshot.year &&
    lastSnapshot.interest === nextSnapshot.interest
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

function setOrRemove(key, value) {
  if (value) {
    window.localStorage.setItem(key, value);
  } else {
    window.localStorage.removeItem(key);
  }
}

export function saveStoredProfile({ name, email, degree, year, interest }) {
  setOrRemove('sb_name', name || '');
  setOrRemove('sb_email', email || '');
  setOrRemove('sb_degree', degree || '');
  setOrRemove('sb_year', year || '');
  setOrRemove('sb_interest', interest || '');
  notifyProfileChanged();
}

export function clearStoredProfile() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem('sb_name');
  window.localStorage.removeItem('sb_email');
  window.localStorage.removeItem('sb_degree');
  window.localStorage.removeItem('sb_year');
  window.localStorage.removeItem('sb_interest');
  notifyProfileChanged();
}
