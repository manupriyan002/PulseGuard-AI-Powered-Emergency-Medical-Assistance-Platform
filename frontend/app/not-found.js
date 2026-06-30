import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f9f7] font-sans">
      <div className="w-32 h-32 rounded-full bg-error-container flex items-center justify-center mb-8">
        <span className="material-symbols-outlined text-error text-6xl">emergency</span>
      </div>
      <h1 className="text-4xl font-bold text-[#1a1c1b] mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-[#3f493f] mb-8 text-center max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/dashboard" className="px-8 py-3 bg-[#00652c] text-white rounded-full font-semibold uppercase tracking-widest hover:bg-[#15803d] transition-colors shadow-lg">
        Return to Dashboard
      </Link>
    </div>
  );
}
