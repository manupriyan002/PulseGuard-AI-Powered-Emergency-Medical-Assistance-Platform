'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import AppShell from '@/components/AppShell';
import { emergencyService } from '@/services/api';

export default function DashboardPage() {
  const { user, loading } = useProtectedRoute();
  const router = useRouter();
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (user) {
      emergencyService.getContacts()
        .then((res) => setContacts(res.data.contacts || []))
        .catch(() => {});
    }
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f9f9f7]"><p>Loading...</p></div>;
  if (!user) return null;

  const greeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      
      <AppShell>
        {/* Greeting */}
        <div className="flex flex-col gap-unit">
          <h1 className="font-headline-lg text-headline-lg text-primary">
            {greeting()}, {user.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Your vitals are stable. Monitoring is active.</p>
        </div>

        {/* SOS + Vitals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* SOS Button */}
          <div
            className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-xl flex flex-col items-center justify-center p-container-padding relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            onClick={() => router.push('/sos')}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-error-container opacity-20 pointer-events-none" />
            <div className="w-48 h-48 rounded-full bg-error flex items-center justify-center shadow-[0_0_60px_rgba(186,26,26,0.6)] ring-8 ring-error-container/50 relative z-10 group-active:scale-95 transition-transform duration-300">
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-on-error text-6xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
                <span className="font-headline-md text-headline-md text-on-error uppercase tracking-widest text-center">Tap to<br />Alert</span>
              </div>
            </div>
          </div>

          {/* Vital Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-gutter">
            <div className="bg-surface-container-lowest rounded-lg shadow-lg p-stack-md flex flex-col justify-between">
              <div className="flex justify-between items-start mb-stack-sm">
                <div className="p-unit bg-tertiary-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary bg-tertiary-fixed px-3 py-1 rounded-full">Live</span>
              </div>
              <div>
                <div className="font-headline-lg text-headline-lg text-on-surface">72 <span className="font-body-md text-body-md text-on-surface-variant">bpm</span></div>
                <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">Heart Rate</div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-lg shadow-lg p-stack-md flex flex-col justify-between">
              <div className="flex justify-between items-start mb-stack-sm">
                <div className="p-unit bg-primary-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>directions_walk</span>
                </div>
              </div>
              <div>
                <div className="font-headline-lg text-headline-lg text-on-surface">4,230</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">Steps Today</div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-lg shadow-lg p-stack-md flex flex-col justify-between">
              <div className="flex justify-between items-start mb-stack-sm">
                <div className="p-unit bg-secondary-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>bedtime</span>
                </div>
              </div>
              <div>
                <div className="font-headline-lg text-headline-lg text-on-surface">7h 12m</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">Sleep Duration</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div
            className="bg-surface-container-lowest rounded-xl shadow-lg p-stack-md flex items-center gap-stack-sm cursor-pointer hover:bg-surface-container-low transition-colors"
            onClick={() => router.push('/ai-triage')}
          >
            <div className="w-16 h-16 rounded-DEFAULT bg-primary-fixed flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary-fixed text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>robot_2</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md text-on-surface">AI Triage</span>
              <span className="font-body-md text-body-md text-on-surface-variant">Symptom checker &amp; guidance</span>
            </div>
          </div>
          <div
            className="bg-surface-container-lowest rounded-xl shadow-lg p-stack-md flex items-center gap-stack-sm cursor-pointer hover:bg-surface-container-low transition-colors"
            onClick={() => router.push('/hospital-finder')}
          >
            <div className="w-16 h-16 rounded-DEFAULT bg-secondary-fixed flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-secondary-fixed text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>local_hospital</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md text-on-surface">Hospital Finder</span>
              <span className="font-body-md text-body-md text-on-surface-variant">Locate nearest care facilities</span>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-surface-container-lowest rounded-xl shadow-lg p-container-padding flex flex-col gap-stack-md">
          <h2 className="font-headline-md text-headline-md text-on-surface">Emergency Contacts</h2>
          <div className="flex gap-gutter overflow-x-auto pb-4">
            {contacts.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-unit min-w-[80px]">
                <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center border-2 border-primary-fixed">
                  <span className="material-symbols-outlined text-on-primary-fixed text-2xl">person</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface">{c.name}</span>
              </div>
            ))}
            <div
              className="flex flex-col items-center justify-center gap-unit min-w-[80px] cursor-pointer"
              onClick={() => router.push('/emergency-contacts')}
            >
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-variant transition-colors border-2 border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-on-surface-variant">add</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Add</span>
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}
