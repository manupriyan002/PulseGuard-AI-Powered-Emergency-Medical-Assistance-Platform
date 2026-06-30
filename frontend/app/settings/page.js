'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import AppShell from '@/components/AppShell';
import { profileService } from '@/services/api';

export default function SettingsPage() {
  const { user, loading } = useProtectedRoute();
  const { logout, fetchUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileService.update({ name, phone });
      setMsg('Profile updated!');
      fetchUser();
    } catch (e) {
      setMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f9f9f7]"><p>Loading...</p></div>;
  if (!user) return null;

  return (
    <>
      
      <AppShell>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Settings</h1>

        {msg && (
          <div className={`px-4 py-3 rounded-lg text-sm text-center ${msg.includes('updated') ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
            {msg}
          </div>
        )}

        {/* Account Settings */}
        <div className="matte-card">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            Account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-4">Full Name</label>
              <input className="w-full bg-surface-container rounded-full py-3 px-6 border-none font-body-md focus:ring-2 focus:ring-primary" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-4">Email</label>
              <input className="w-full bg-surface-container rounded-full py-3 px-6 border-none font-body-md text-outline" value={user.email} disabled />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-4">Phone</label>
              <input className="w-full bg-surface-container rounded-full py-3 px-6 border-none font-body-md focus:ring-2 focus:ring-primary" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
            </div>
          </div>
          <button className="mt-6 px-8 py-3 bg-primary text-on-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest shadow-lg disabled:opacity-50" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="matte-card flex items-center gap-4 cursor-pointer hover:bg-surface-container-low transition-colors" onClick={() => router.push('/medical-profile')}>
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_information</span>
            <span className="font-body-lg text-body-lg font-semibold text-on-background">Medical Profile</span>
          </div>
          <div className="matte-card flex items-center gap-4 cursor-pointer hover:bg-surface-container-low transition-colors" onClick={() => router.push('/qr-profile')}>
            <span className="material-symbols-outlined text-tertiary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
            <span className="font-body-lg text-body-lg font-semibold text-on-background">QR Profile</span>
          </div>
          <div className="matte-card flex items-center gap-4 cursor-pointer hover:bg-surface-container-low transition-colors" onClick={() => router.push('/emergency-contacts')}>
            <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>contacts</span>
            <span className="font-body-lg text-body-lg font-semibold text-on-background">Emergency Contacts</span>
          </div>
        </div>

        {/* Sign Out */}
        <div className="matte-card border-2 border-error-container/50">
          <h2 className="font-headline-md text-headline-md text-error mb-4">Sign Out</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">Sign out of your PulseGuard account on this device.</p>
          <button className="px-8 py-3 bg-error text-on-error rounded-full font-label-sm text-label-sm uppercase tracking-widest shadow-lg hover:shadow-xl transition-all" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </AppShell>
    </>
  );
}
