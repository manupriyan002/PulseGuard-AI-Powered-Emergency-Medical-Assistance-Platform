'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  auth,
  createUserWithEmailAndPassword,
} from '@/services/firebase';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleRegister = async (e) => {
    e?.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Name, email, and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Register with backend
      await register({
        name,
        email,
        phone,
        firebaseUid: firebaseUser.uid,
      });

      router.push('/dashboard');
    } catch (err) {
      const code = err.code || '';
      if (code === 'auth/email-already-in-use') setError('An account with this email already exists.');
      else if (code === 'auth/weak-password') setError('Password is too weak. Use at least 6 characters.');
      else if (code === 'auth/invalid-email') setError('Invalid email address.');
      else setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ─── Exact Stitch Register UI ─── */}
      <div className="bg-background text-on-background min-h-screen flex flex-col md:flex-row antialiased selection:bg-primary-container selection:text-on-primary-container">

        {/* Left Visual Panel */}
        <div className="hidden md:flex md:w-5/12 lg:w-1/2 relative bg-surface-container-low overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-low to-transparent z-10 mix-blend-multiply" />
          <img
            alt="Clinical visual"
            className="w-full h-full object-cover object-center"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuASRxRlo8R-eDiZ70EQXoIRemfCnexgPjGW8lZCX59lgnUpkr2aJ_Onb_nnUB67mIfOo8ShUl-fcqavdCaLI-v_O2OsXSPSrSIHR4bKvThdXblFHUs8Qrk7V_nafyZ9nKxcts51W7Xk8n8LaOKkHrY8VFTGIN5lMS_mhYFmpb7InQjpQWmomdDVFaa7V8TxtfKYdZc8C1Sd_jnWz8QAkQpOHHQy2if0OvIOpRxC3tepgeNGEuEEJ83RShy-1KGyuYOra3BlUUCpYHs"
          />
          <div className="absolute bottom-12 left-12 z-20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>vital_signs</span>
            </div>
            <span className="font-headline-md text-headline-md text-surface tracking-tight">PulseGuard</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col justify-center px-8 py-12 md:px-16 lg:px-24">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="mb-12">
              <div className="md:hidden flex items-center gap-2 mb-8">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>vital_signs</span>
                <span className="font-headline-md text-headline-md text-primary tracking-tight">PulseGuard</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-3">Create an account</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Join our secure network for premium health monitoring and rapid response.</p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm text-center mb-6">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase ml-4">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline-variant">person</span>
                  <input
                    className="w-full bg-surface-container text-on-surface font-body-md text-body-md py-4 pl-14 pr-6 rounded-full border-none focus:ring-2 focus:ring-primary shadow-[inset_0_2px_6px_rgba(0,0,0,0.04)] placeholder:text-outline transition-all"
                    placeholder="John Doe"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase ml-4">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline-variant">mail</span>
                  <input
                    className="w-full bg-surface-container text-on-surface font-body-md text-body-md py-4 pl-14 pr-6 rounded-full border-none focus:ring-2 focus:ring-primary shadow-[inset_0_2px_6px_rgba(0,0,0,0.04)] placeholder:text-outline transition-all"
                    placeholder="hello@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase ml-4">Phone Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline-variant">phone</span>
                  <input
                    className="w-full bg-surface-container text-on-surface font-body-md text-body-md py-4 pl-14 pr-6 rounded-full border-none focus:ring-2 focus:ring-primary shadow-[inset_0_2px_6px_rgba(0,0,0,0.04)] placeholder:text-outline transition-all"
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase ml-4">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
                  <input
                    className="w-full bg-surface-container text-on-surface font-body-md text-body-md py-4 pl-14 pr-6 rounded-full border-none focus:ring-2 focus:ring-primary shadow-[inset_0_2px_6px_rgba(0,0,0,0.04)] placeholder:text-outline transition-all"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-6">
                <button
                  className="group relative w-full flex items-center justify-between p-2 pl-8 bg-primary rounded-full hover:bg-surface-tint transition-all duration-300 shadow-[0_12px_30px_-10px_rgba(0,101,44,0.4)] hover:shadow-[0_16px_40px_-10px_rgba(0,101,44,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                >
                  <span className="font-label-sm text-label-sm text-on-primary uppercase tracking-widest">
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </span>
                  <div className="w-12 h-12 bg-on-primary rounded-full flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300 shadow-inner">
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 600" }}>arrow_forward</span>
                    )}
                  </div>
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account?
                <a className="text-primary font-semibold hover:text-surface-tint transition-colors ml-1 cursor-pointer" onClick={() => router.push('/login')}>Sign in</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
