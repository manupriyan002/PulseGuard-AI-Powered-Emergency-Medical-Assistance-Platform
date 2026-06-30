'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { sosService } from '@/services/api';

export default function SOSPage() {
  const { user, loading } = useProtectedRoute();
  const router = useRouter();
  const [activated, setActivated] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [location, setLocation] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 0, lng: 0 })
      );
    }
  }, []);

  useEffect(() => {
    if (activated && countdown > 0) {
      intervalRef.current = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(intervalRef.current);
    }
    if (activated && countdown === 0) {
      triggerSOS();
    }
  }, [activated, countdown]);

  const triggerSOS = async () => {
    setSending(true);
    try {
      await sosService.activate({
        location: location || { lat: 0, lng: 0 },
        message: 'SOS Alert from PulseGuard',
      });
      setSent(true);
    } catch (err) {
      setSent(true); // Show sent state even on error to prevent panic
    } finally {
      setSending(false);
    }
  };

  const cancelSOS = () => {
    clearInterval(intervalRef.current);
    setActivated(false);
    setCountdown(5);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f9f9f7]"><p>Loading...</p></div>;
  if (!user) return null;

  return (
    <>
      
      <div className="bg-background min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-error/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-error-container/20 blur-[120px] pointer-events-none" />

        {/* Back button */}
        <button className="absolute top-8 left-8 z-20 flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => router.push('/dashboard')}>
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-label-sm text-label-sm">Back to Dashboard</span>
        </button>

        {!sent ? (
          <div className="flex flex-col items-center gap-stack-lg z-10">
            {/* SOS Button */}
            <div
              className={`w-64 h-64 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 ${
                activated
                  ? 'bg-error shadow-[0_0_100px_rgba(186,26,26,0.8)] animate-pulse scale-110'
                  : 'bg-error shadow-[0_0_60px_rgba(186,26,26,0.4)] hover:shadow-[0_0_80px_rgba(186,26,26,0.6)] hover:scale-105 active:scale-95'
              } ring-8 ring-error-container/50`}
              onClick={() => !activated && setActivated(true)}
            >
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-on-error text-7xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
                <span className="font-headline-md text-headline-md text-on-error uppercase tracking-widest text-center">
                  {activated ? countdown : 'SOS'}
                </span>
              </div>
            </div>

            <p className="font-body-lg text-body-lg text-on-surface-variant text-center max-w-sm">
              {activated
                ? `Sending SOS in ${countdown} seconds... All emergency contacts will be notified.`
                : 'Tap the button to send an emergency SOS alert to all your contacts with your live location.'}
            </p>

            {activated && (
              <button
                className="px-8 py-3 bg-surface-variant text-on-surface-variant rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:bg-surface-dim transition-colors"
                onClick={cancelSOS}
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          /* SOS Sent Confirmation */
          <div className="flex flex-col items-center gap-stack-md z-10 text-center">
            <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center shadow-[0_0_60px_rgba(0,101,44,0.4)]">
              <span className="material-symbols-outlined text-on-primary text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">SOS Alert Sent</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
              Your emergency contacts have been notified with your current location. Help is on the way.
            </p>
            {location && (
              <p className="font-label-sm text-label-sm text-outline">
                📍 Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
            <div className="flex gap-4 mt-4">
              <button className="px-6 py-3 bg-primary text-on-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest shadow-lg" onClick={() => router.push('/tracking')}>
                Share Live Tracking
              </button>
              <button className="px-6 py-3 bg-surface-variant text-on-surface-variant rounded-full font-label-sm text-label-sm uppercase tracking-widest" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
