'use client';

import { useState, useEffect } from 'react';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import AppShell from '@/components/AppShell';
import { emergencyService } from '@/services/api';

export default function EmergencyContactsPage() {
  const { user, loading } = useProtectedRoute();
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', relationship: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) loadContacts();
  }, [user]);

  const loadContacts = async () => {
    try {
      const res = await emergencyService.getContacts();
      setContacts(res.data.contacts || []);
    } catch (e) {}
  };

  const handleAdd = async () => {
    if (!form.name || !form.phone) { setMsg('Name and phone are required.'); return; }
    setSaving(true);
    setMsg('');
    try {
      await emergencyService.addContact(form);
      setMsg('Contact added!');
      setForm({ name: '', phone: '', email: '', relationship: '' });
      setShowForm(false);
      loadContacts();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to add contact.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contactId) => {
    try {
      await emergencyService.removeContact(contactId);
      loadContacts();
    } catch (e) {}
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f9f9f7]"><p>Loading...</p></div>;
  if (!user) return null;

  return (
    <>
      
      <AppShell>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Emergency Contacts</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">People who will be notified during an SOS alert.</p>
          </div>
          <button
            className="px-6 py-3 bg-primary text-on-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            onClick={() => setShowForm(!showForm)}
          >
            <span className="material-symbols-outlined text-[18px]">{showForm ? 'close' : 'add'}</span>
            {showForm ? 'Cancel' : 'Add Contact'}
          </button>
        </div>

        {msg && (
          <div className={`px-4 py-3 rounded-lg text-sm text-center ${msg.includes('added') ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
            {msg}
          </div>
        )}

        {/* Add Contact Form */}
        {showForm && (
          <div className="matte-card">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">New Emergency Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-4">Name *</label>
                <input className="w-full bg-surface-container rounded-full py-3 px-6 border-none font-body-md focus:ring-2 focus:ring-primary" placeholder="Contact name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-4">Phone *</label>
                <input className="w-full bg-surface-container rounded-full py-3 px-6 border-none font-body-md focus:ring-2 focus:ring-primary" placeholder="+1 555 000 0000" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-4">Email</label>
                <input className="w-full bg-surface-container rounded-full py-3 px-6 border-none font-body-md focus:ring-2 focus:ring-primary" placeholder="email@example.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-4">Relationship</label>
                <input className="w-full bg-surface-container rounded-full py-3 px-6 border-none font-body-md focus:ring-2 focus:ring-primary" placeholder="e.g. Mother, Doctor" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
              </div>
            </div>
            <button className="mt-6 w-full md:w-auto px-8 py-3 bg-primary text-on-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest shadow-lg disabled:opacity-50" onClick={handleAdd} disabled={saving}>
              {saving ? 'Saving...' : 'Save Contact'}
            </button>
          </div>
        )}

        {/* Contact List */}
        <div className="flex flex-col gap-4">
          {contacts.length === 0 ? (
            <div className="matte-card text-center py-12">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">contacts</span>
              <h3 className="font-headline-md text-headline-md text-on-surface-variant">No Emergency Contacts</h3>
              <p className="font-body-md text-body-md text-outline mt-2">Add contacts who should be notified during emergencies.</p>
            </div>
          ) : (
            contacts.map((c, i) => (
              <div key={i} className="matte-card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-fixed text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                  </div>
                  <div>
                    <h3 className="font-body-lg text-body-lg font-semibold text-on-background">{c.name}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">{c.phone} {c.relationship ? `• ${c.relationship}` : ''}</p>
                    {c.email && <p className="font-label-sm text-label-sm text-outline">{c.email}</p>}
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-error-container/30 text-error flex items-center justify-center hover:bg-error-container transition-colors" onClick={() => handleDelete(c._id)}>
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            ))
          )}
        </div>
      </AppShell>
    </>
  );
}
