'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  auth,
  signInWithEmailAndPassword,
  googleProvider,
  signInWithPopup,
} from '@/services/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuth();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Sync with backend
      await login(firebaseUser.email, firebaseUser.uid);

      router.push('/dashboard');
    } catch (err) {
      const code = err.code || '';
      if (code === 'auth/user-not-found') setError('No account found with this email.');
      else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') setError('Invalid email or password.');
      else if (code === 'auth/too-many-requests') setError('Too many attempts. Please try again later.');
      else setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Try login first, if user doesn't exist in backend, register
      try {
        await login(firebaseUser.email, firebaseUser.uid);
      } catch {
        // Auto-register if not found
        await register({
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          firebaseUid: firebaseUser.uid,
        });
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ─── Exact Stitch Login UI ─── */}
      <div className="bg-background min-h-screen w-full flex overflow-hidden font-body-md text-body-md">

        {/* Left Visual Panel */}
        <div className="hidden lg:flex flex-1 relative bg-surface-variant overflow-hidden">
          <img
            alt="Medical Abstract"
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhxKnKKsNcWP5wxD3AWhKiqA1ywnfXKnXXSqtt0v3cFEH_WLMwoxq0-w1cK_D7ClB2czGwYNkxd6zInEENTBsZfINHdtm1QON1lNhCRxRbPmrHOzHVy5pIteIk70wxDv2rmOQ0Ji0wpKygnAcO-dG9-EwkgGJxTjb7XeJ-G_cLNTuM4-WCvQcQFA0oZ-ZjLWy5M6znPLejCrTIFykEfdirUyENG-ngu0LZSkd3NZvQgSIOufhsHgHIwzJ-HPT2gvX0Zgez2-RGv-c"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-50" />
          <div className="absolute bottom-12 left-12 flex items-center gap-3">
            <div className="w-12 h-12 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-2xl">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>ecg</span>
            </div>
            <span className="font-headline-md text-headline-md text-on-surface">PulseGuard</span>
          </div>
        </div>

        {/* Right Login Panel */}
        <div className="flex-1 flex flex-col justify-center items-center px-container-padding bg-background overflow-y-auto">
          <div className="w-full max-w-md flex flex-col">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-stack-lg justify-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-on-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>ecg</span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface">PulseGuard</span>
            </div>

            {/* Matte Card Container */}
            <div className="bg-surface-container-lowest rounded-lg p-10 shadow-2xl flex flex-col gap-stack-md w-full relative z-10">
              {/* Header */}
              <div className="text-center mb-stack-sm">
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Welcome Back</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Secure access to your clinical dashboard.</p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm text-center animate-[shake_0.3s_ease-in-out]">
                  {error}
                </div>
              )}

              {/* Form */}
              <form className="flex flex-col gap-stack-sm w-full" onSubmit={handleLogin}>
                {/* Email Input */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant pl-4" htmlFor="email">Email Address</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-4 text-outline">mail</span>
                    <input
                      className="w-full pl-12 pr-6 py-4 bg-surface-container rounded-full shadow-inner text-on-surface placeholder:text-outline-variant border-none focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all font-body-md text-body-md"
                      id="email"
                      placeholder="doctor@pulseguard.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-2 mt-4">
                  <label className="font-label-sm text-label-sm text-on-surface-variant pl-4 flex justify-between w-full" htmlFor="password">
                    <span>Password</span>
                    <a className="text-primary hover:text-primary-container transition-colors cursor-pointer" onClick={() => router.push('/forgot-password')}>Forgot?</a>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-4 text-outline">lock</span>
                    <input
                      className="w-full pl-12 pr-6 py-4 bg-surface-container rounded-full shadow-inner text-on-surface placeholder:text-outline-variant border-none focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all font-body-md text-body-md"
                      id="password"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  className="mt-8 w-full py-4 bg-primary text-on-primary rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all font-label-sm text-label-sm uppercase tracking-widest flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                  ) : (
                    <>
                      Sign In
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center py-4 mt-2">
                <div className="flex-grow border-t border-surface-variant" />
                <span className="flex-shrink-0 mx-4 font-label-sm text-label-sm text-outline">OR</span>
                <div className="flex-grow border-t border-surface-variant" />
              </div>

              {/* Google SSO */}
              <button
                className="w-full py-4 bg-surface text-on-surface rounded-full shadow-inner hover:bg-surface-container-high transition-colors border border-surface-variant font-label-sm text-label-sm flex items-center justify-center gap-3 disabled:opacity-50"
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Footer */}
            <p className="text-center mt-stack-md font-body-md text-body-md text-on-surface-variant">
              Don't have an account? <a className="text-primary font-semibold hover:underline cursor-pointer" onClick={() => router.push('/register')}>Register</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
