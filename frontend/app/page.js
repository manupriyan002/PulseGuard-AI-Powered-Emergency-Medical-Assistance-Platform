'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Landing page using exact Stitch HTML rendered inline.
 * Navigation links are wired to actual routes via postMessage from iframe.
 */
export default function LandingPage() {
  const iframeRef = useRef(null);
  const router = useRouter();
  const [iframeHeight, setIframeHeight] = useState('100vh');

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        // Auto-resize iframe
        setIframeHeight(doc.body.scrollHeight + 'px');

        // Wire navigation buttons
        const buttons = doc.querySelectorAll('button');
        buttons.forEach((btn) => {
          const text = btn.textContent.trim().toLowerCase();
          if (text.includes('get started')) {
            btn.addEventListener('click', () => router.push('/register'));
          }
          if (text.includes('download')) {
            btn.addEventListener('click', () => router.push('/register'));
          }
        });

        // Wire nav links
        const links = doc.querySelectorAll('a');
        links.forEach((link) => {
          const text = link.textContent.trim().toLowerCase();
          if (text.includes('get started')) {
            link.addEventListener('click', (e) => { e.preventDefault(); router.push('/register'); });
          }
        });
      } catch (e) {
        // Cross-origin safety
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [router]);

  return (
    <div style={{ width: '100%', minHeight: '100vh' }}>
      <iframe
        ref={iframeRef}
        src="/stitch-screens/desktop/landing.html"
        title="PulseGuard Landing"
        style={{
          width: '100%',
          height: iframeHeight,
          border: 'none',
          display: 'block',
        }}
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}
