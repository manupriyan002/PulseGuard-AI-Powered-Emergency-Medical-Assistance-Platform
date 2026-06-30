'use client';

import { useState, useEffect } from 'react';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import AppShell from '@/components/AppShell';
import { hospitalService } from '@/services/api';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function HospitalFinderPage() {
  const { user, loading } = useProtectedRoute();
  const [hospitals, setHospitals] = useState([]);
  const [searching, setSearching] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          searchHospitals(loc);
        },
        () => setError('Location access denied. Please enable location services.')
      );
    }
  }, []);

  const searchHospitals = async (loc) => {
    setSearching(true);
    setError('');
    try {
      const res = await hospitalService.findNearby(loc.lat, loc.lng, 5000);
      setHospitals(res.data.hospitals || []);
    } catch (e) {
      setError('Failed to find nearby hospitals. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f9f9f7]"><p>Loading...</p></div>;
  if (!user) return null;

  return (
    <>
      
      <AppShell>
        <div className="flex flex-col gap-unit">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Hospital Finder</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Locate the nearest medical facilities to your current position.</p>
        </div>

        {/* Location Status */}
        <div className="matte-card flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
            </div>
            <div>
              <h3 className="font-body-lg text-body-lg font-semibold text-on-background">Current Location</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Acquiring...'}
              </p>
            </div>
          </div>
          <button
            className="px-5 py-2 bg-primary text-on-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest shadow-md disabled:opacity-50"
            onClick={() => location && searchHospitals(location)}
            disabled={searching || !location}
          >
            {searching ? 'Searching...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm text-center">{error}</div>
        )}

        {/* Map View */}
        <div className="h-64 md:h-96 w-full rounded-2xl overflow-hidden shadow-lg border-4 border-white">
          {location ? (
            <Map 
              center={location} 
              markers={hospitals.map(h => ({ lat: h.lat, lng: h.lng, title: h.name, type: 'hospital' }))} 
            />
          ) : (
            <div className="h-full w-full bg-surface-container-low flex items-center justify-center font-body-md text-on-surface-variant">
              Waiting for location...
            </div>
          )}
        </div>

        {/* Hospital List */}
        <div className="flex flex-col gap-4">
          {searching ? (
            <div className="matte-card text-center py-12">
              <span className="material-symbols-outlined animate-spin text-primary text-4xl mb-4">progress_activity</span>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Searching nearby hospitals...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="matte-card text-center py-12">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">local_hospital</span>
              <h3 className="font-headline-md text-headline-md text-on-surface-variant">No Hospitals Found</h3>
              <p className="font-body-md text-body-md text-outline mt-2">Try expanding the search radius or check your location settings.</p>
            </div>
          ) : (
            hospitals.map((h, i) => (
              <div key={i} className="matte-card flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-DEFAULT bg-secondary-fixed flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-secondary-fixed text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
                  </div>
                  <div>
                    <h3 className="font-body-lg text-body-lg font-semibold text-on-background">{h.name || 'Hospital'}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">{h.distance ? `${h.distance.toFixed(1)} km away` : ''}</p>
                    {h.phone && <p className="font-label-sm text-label-sm text-primary mt-1">📞 {h.phone}</p>}
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary text-on-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest shadow-md hover:shadow-lg transition-all"
                >
                  Navigate
                </a>
              </div>
            ))
          )}
        </div>
      </AppShell>
    </>
  );
}
