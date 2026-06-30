'use client';

import { useState, useEffect } from 'react';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import AppShell from '@/components/AppShell';
import { medicalService } from '@/services/api';

export default function MedicalProfilePage() {
  const { user, loading } = useProtectedRoute();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ bloodGroup: '', allergies: '', conditions: '', medications: '', surgeries: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) {
      medicalService.getProfile()
        .then((res) => {
          const p = res.data.medicalProfile;
          setProfile(p);
          setForm({
            bloodGroup: p.bloodGroup || '',
            allergies: (p.allergies || []).join(', '),
            conditions: (p.conditions || []).join(', '),
            medications: (p.medications || []).join(', '),
            surgeries: (p.surgeries || []).join(', '),
          });
        })
        .catch(() => {});
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      await medicalService.updateProfile({
        bloodGroup: form.bloodGroup,
        allergies: form.allergies.split(',').map((s) => s.trim()).filter(Boolean),
        conditions: form.conditions.split(',').map((s) => s.trim()).filter(Boolean),
        medications: form.medications.split(',').map((s) => s.trim()).filter(Boolean),
        surgeries: form.surgeries.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setMsg('Profile saved successfully!');
      setEditing(false);
    } catch (err) {
      setMsg('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f9f9f7]"><p>Loading...</p></div>;
  if (!user) return null;

  return (
    <>
      
      <AppShell>
        {/* Profile Header */}
        <section className="matte-card flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shadow-xl shrink-0 border-4 border-surface-container-lowest bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Monitoring Active: Safe
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">{user.name}</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              {user.email} • Blood Type: {form.bloodGroup || 'Not set'}
            </p>
          </div>
          <div className="absolute -right-20 -bottom-20 opacity-10 pointer-events-none hidden md:block">
            <span className="material-symbols-outlined text-[300px]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_information</span>
          </div>
        </section>

        {/* Edit Toggle + Status */}
        <div className="flex justify-between items-center">
          <h2 className="font-headline-md text-headline-md text-on-surface">Medical Records</h2>
          <button
            className={`px-6 py-2 rounded-full font-label-sm text-label-sm transition-all ${editing ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary text-on-primary shadow-md hover:shadow-lg'}`}
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
          >
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        {msg && (
          <div className={`px-4 py-3 rounded-lg text-sm text-center ${msg.includes('success') ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
            {msg}
          </div>
        )}

        {/* Medical Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* Blood Group */}
          <div className="matte-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center embossed-icon">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
              </div>
              <h3 className="font-body-lg text-body-lg font-semibold text-on-background">Blood Group</h3>
            </div>
            {editing ? (
              <select className="w-full bg-surface-container rounded-full py-3 px-6 border-none font-body-md" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            ) : (
              <div className="font-headline-lg text-headline-lg text-on-surface">{form.bloodGroup || '—'}</div>
            )}
          </div>

          {/* Allergies */}
          <div className="matte-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center embossed-icon">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              <h3 className="font-body-lg text-body-lg font-semibold text-on-background">Allergies</h3>
            </div>
            {editing ? (
              <input className="w-full bg-surface-container rounded-full py-3 px-6 border-none font-body-md" placeholder="e.g. Penicillin, Pollen" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
            ) : (
              <div className="flex flex-col gap-2">
                {form.allergies ? form.allergies.split(',').map((a, i) => (
                  <div key={i} className="bg-error-container/30 border border-error-container rounded-DEFAULT p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-error text-on-error flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>pill</span>
                    </div>
                    <span className="font-body-md text-body-md font-semibold text-on-error-container">{a.trim()}</span>
                  </div>
                )) : <p className="text-on-surface-variant font-body-md">No allergies recorded</p>}
              </div>
            )}
          </div>

          {/* Medications */}
          <div className="matte-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center embossed-icon">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medication</span>
              </div>
              <h3 className="font-body-lg text-body-lg font-semibold text-on-background">Medications</h3>
            </div>
            {editing ? (
              <input className="w-full bg-surface-container rounded-full py-3 px-6 border-none font-body-md" placeholder="e.g. Lisinopril, Vitamin D3" value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} />
            ) : (
              <div className="flex flex-col gap-3">
                {form.medications ? form.medications.split(',').map((m, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-DEFAULT bg-surface-container-low">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>prescriptions</span>
                    </div>
                    <span className="font-body-lg text-body-lg font-semibold text-on-background">{m.trim()}</span>
                  </div>
                )) : <p className="text-on-surface-variant font-body-md">No medications recorded</p>}
              </div>
            )}
          </div>

          {/* Conditions & Surgeries */}
          <div className="matte-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center embossed-icon">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
              </div>
              <h3 className="font-body-lg text-body-lg font-semibold text-on-background">Conditions & Surgeries</h3>
            </div>
            {editing ? (
              <div className="flex flex-col gap-4">
                <input className="w-full bg-surface-container rounded-full py-3 px-6 border-none font-body-md" placeholder="Conditions: e.g. Hypertension, Asthma" value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} />
                <input className="w-full bg-surface-container rounded-full py-3 px-6 border-none font-body-md" placeholder="Surgeries: e.g. Appendectomy" value={form.surgeries} onChange={(e) => setForm({ ...form, surgeries: e.target.value })} />
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-surface-variant flex flex-col gap-6 py-2">
                {[...(form.conditions ? form.conditions.split(',') : []), ...(form.surgeries ? form.surgeries.split(',') : [])].filter(Boolean).map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-surface-container-lowest border-2 border-primary" />
                    <h4 className="font-body-lg text-body-lg font-semibold text-on-background">{item.trim()}</h4>
                  </div>
                ))}
                {!form.conditions && !form.surgeries && <p className="text-on-surface-variant font-body-md">No history recorded</p>}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </>
  );
}
