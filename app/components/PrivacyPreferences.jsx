'use client';

export default function PrivacyPreferences() {
  return <button type="button" className="btn btn-outline" onClick={() => window.dispatchEvent(new Event('sb_open_consent'))}>Change cookie preferences</button>;
}
