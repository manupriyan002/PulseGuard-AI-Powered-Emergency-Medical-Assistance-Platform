'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: 'grid_view', path: '/dashboard' },
  { label: 'AI Triage', icon: 'health_and_safety', path: '/ai-triage' },
  { label: 'Medical Profile', icon: 'medical_information', path: '/medical-profile' },
  { label: 'Hospital Finder', icon: 'local_hospital', path: '/hospital-finder' },
  { label: 'Live Tracking', icon: 'distance', path: '/tracking' },
  { label: 'Emergency Contacts', icon: 'contacts', path: '/emergency-contacts' },
  { label: 'QR Profile', icon: 'qr_code_2', path: '/qr-profile' },
  { label: 'Settings', icon: 'settings', path: '/settings' },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const greeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/20 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.04)] bg-white/60 shadow-2xl shadow-black/5">
        <div className="flex justify-between items-center px-8 py-4 w-full max-w-7xl mx-auto">
          <div
            className="text-xl font-black text-green-800 tracking-tighter hover:opacity-80 transition-opacity active:scale-95 duration-300 cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
            PulseGuard
          </div>
          <div className="flex items-center gap-gutter">
            <span className="material-symbols-outlined text-green-700 hover:opacity-80 transition-opacity active:scale-95 duration-300 cursor-pointer">
              notifications
            </span>
            <span
              className="material-symbols-outlined text-green-700 hover:opacity-80 transition-opacity active:scale-95 duration-300 cursor-pointer"
              onClick={() => router.push('/settings')}
            >
              account_circle
            </span>
            <button
              className="ml-2 text-sm text-on-surface-variant hover:text-error transition-colors"
              onClick={() => { logout(); router.push('/login'); }}
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-24 pb-32 md:pb-8 w-full max-w-7xl mx-auto px-gutter gap-gutter">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 pt-stack-md gap-stack-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <div
                key={item.path}
                className={`flex items-center gap-unit p-unit rounded-DEFAULT cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
                onClick={() => router.push(item.path)}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="font-label-sm text-label-sm">{item.label}</span>
              </div>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-stack-lg min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md rounded-full border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white/70 backdrop-blur-2xl z-50 flex justify-around items-center px-6 py-3">
        {[
          { icon: 'grid_view', label: 'Home', path: '/dashboard' },
          { icon: 'distance', label: 'Track', path: '/tracking' },
          { icon: 'emergency', label: 'SOS', path: '/sos', isRed: true },
          { icon: 'chat_bubble', label: 'Chat', path: '/ai-triage' },
          { icon: 'person', label: 'Profile', path: '/medical-profile' },
        ].map((item) => {
          const isActive = pathname === item.path;
          return (
            <div
              key={item.path}
              className={`flex flex-col items-center justify-center cursor-pointer transition-all ${
                isActive ? 'text-green-700 scale-110' : 'text-slate-400 hover:text-green-600'
              } ${item.isRed ? 'text-error' : ''}`}
              onClick={() => router.push(item.path)}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className={`font-['Inter'] text-[10px] font-semibold uppercase tracking-widest mt-1 ${item.isRed ? 'text-error' : ''}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
