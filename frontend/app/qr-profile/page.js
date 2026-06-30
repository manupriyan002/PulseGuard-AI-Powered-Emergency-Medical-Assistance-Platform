'use client';

import { useState, useEffect } from 'react';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import AppShell from '@/components/AppShell';
import { qrService } from '@/services/api';

export default function QRProfilePage() {
  const { user, loading } = useProtectedRoute();
  const [qrData, setQrData] = useState(null);
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [showSetPin, setShowSetPin] = useState(false);
  const [msg, setMsg] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) generateQR();
  }, [user]);

  const generateQR = async () => {
    setGenerating(true);
    try {
      const res = await qrService.generate();
      setQrData(res.data);
    } catch (e) {
      setMsg('Failed to generate QR code.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSetPin = async () => {
    if (newPin.length < 4) { setMsg('PIN must be at least 4 digits.'); return; }
    try {
      await qrService.setPin({ pin: newPin });
      setMsg('PIN set successfully!');
      setShowSetPin(false);
      setNewPin('');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to set PIN.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f9f9f7]"><p>Loading...</p></div>;
  if (!user) return null;

  return (
    <>
      
      <AppShell>
        <div className="flex flex-col gap-unit">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">QR Medical Profile</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Share your medical information securely via QR code.</p>
        </div>

        {msg && (
          <div className={`px-4 py-3 rounded-lg text-sm text-center ${msg.includes('success') ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* QR Code Card */}
          <div className="matte-card flex flex-col items-center gap-stack-md">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Your Medical QR</h2>

            {generating ? (
              <div className="w-64 h-64 bg-surface-container rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
              </div>
            ) : qrData?.qrCode ? (
              <img src={qrData.qrCode} alt="Medical QR Code" className="w-64 h-64 rounded-lg shadow-lg" />
            ) : (
              <div className="w-64 h-64 bg-surface-container rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-outline-variant">qr_code_2</span>
              </div>
            )}

            <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-xs">
              First responders can scan this QR code to access your critical medical information.
            </p>

            <button className="px-6 py-3 bg-primary text-on-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest shadow-lg hover:shadow-xl transition-all" onClick={generateQR}>
              Regenerate QR
            </button>
          </div>

          {/* PIN Security Card */}
          <div className="matte-card flex flex-col gap-stack-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface">PIN Protection</h2>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant">
              Set a 4-digit PIN to protect your medical profile. Anyone scanning your QR will need this PIN to view sensitive data.
            </p>

            {showSetPin ? (
              <div className="flex flex-col gap-4">
                <input
                  className="w-full bg-surface-container rounded-full py-4 px-6 border-none font-headline-md text-headline-md text-center tracking-[0.5em] focus:ring-2 focus:ring-primary"
                  placeholder="0000"
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                />
                <div className="flex gap-3">
                  <button className="flex-1 px-6 py-3 bg-primary text-on-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest" onClick={handleSetPin}>
                    Save PIN
                  </button>
                  <button className="px-6 py-3 bg-surface-variant text-on-surface-variant rounded-full font-label-sm text-label-sm" onClick={() => setShowSetPin(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button className="px-6 py-3 bg-tertiary text-on-tertiary rounded-full font-label-sm text-label-sm uppercase tracking-widest shadow-lg w-fit" onClick={() => setShowSetPin(true)}>
                {user.pinHash ? 'Change PIN' : 'Set PIN'}
              </button>
            )}

            {/* Info Cards */}
            <div className="flex flex-col gap-3 mt-4">
              <div className="bg-surface-container-low rounded-DEFAULT p-4 flex items-center gap-4">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <div>
                  <div className="font-body-md text-body-md font-semibold text-on-background">AES-256 Encrypted</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">Medical data is encrypted at rest</div>
                </div>
              </div>
              <div className="bg-surface-container-low rounded-DEFAULT p-4 flex items-center gap-4">
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
                <div>
                  <div className="font-body-md text-body-md font-semibold text-on-background">Access Logged</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">Every QR scan is timestamped</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}
