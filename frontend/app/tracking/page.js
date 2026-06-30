'use client';

import { useState, useEffect } from 'react';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import AppShell from '@/components/AppShell';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function TrackingPage() {
  const { user, loading } = useProtectedRoute();
  const [location, setLocation] = useState(null);
  const [watching, setWatching] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [history, setHistory] = useState([]);

  const startTracking = () => {
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, time: new Date().toLocaleTimeString() };
          setLocation(loc);
          setHistory((prev) => [...prev.slice(-20), loc]);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
      setWatchId(id);
      setWatching(true);
    }
  };

  const stopTracking = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    setWatching(false);
  };

  useEffect(() => () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); }, [watchId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f9f9f7]"><p>Loading...</p></div>;
  if (!user) return null;

  return (
    <>
      
      <AppShell>
        <div className="flex flex-col gap-unit">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Live Tracking</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Share your real-time location with emergency contacts.</p>
        </div>

        {/* Current Location Card */}
        <div className="matte-card relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
              Current Position
            </h2>
            <span className={`px-4 py-1 rounded-full font-label-sm text-label-sm ${watching ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-variant text-on-surface-variant'}`}>
              {watching ? '● Live' : '○ Inactive'}
            </span>
          </div>

          {location ? (
            <div className="flex flex-col gap-4 mb-6">
              <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <Map center={location} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low rounded-DEFAULT p-4">
                  <div className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Latitude</div>
                  <div className="font-headline-md text-headline-md text-on-surface">{location.lat.toFixed(6)}</div>
                </div>
                <div className="bg-surface-container-low rounded-DEFAULT p-4">
                  <div className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Longitude</div>
                  <div className="font-headline-md text-headline-md text-on-surface">{location.lng.toFixed(6)}</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Start tracking to see your live coordinates.</p>
          )}

          <div className="flex gap-4">
            {!watching ? (
              <button className="px-8 py-3 bg-primary text-on-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest shadow-lg hover:shadow-xl transition-all flex items-center gap-2" onClick={startTracking}>
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Start Tracking
              </button>
            ) : (
              <button className="px-8 py-3 bg-error text-on-error rounded-full font-label-sm text-label-sm uppercase tracking-widest shadow-lg hover:shadow-xl transition-all flex items-center gap-2" onClick={stopTracking}>
                <span className="material-symbols-outlined text-[18px]">stop</span>
                Stop Tracking
              </button>
            )}
            {location && (
              <a
                href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-surface-variant text-on-surface-variant rounded-full font-label-sm text-label-sm uppercase tracking-widest flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">map</span>
                Open in Maps
              </a>
            )}
          </div>
        </div>

        {/* Location History */}
        {history.length > 0 && (
          <div className="matte-card">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-outline" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
              Location History
            </h2>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {history.slice().reverse().map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-DEFAULT bg-surface-container-low">
                  <span className="font-body-md text-body-md text-on-surface">{h.lat.toFixed(6)}, {h.lng.toFixed(6)}</span>
                  <span className="font-label-sm text-label-sm text-outline">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </AppShell>
    </>
  );
}
