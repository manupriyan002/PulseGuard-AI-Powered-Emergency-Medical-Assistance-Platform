'use client';

import { useEffect, useRef } from 'react';

/**
 * StitchScreen Component
 * Renders downloaded Stitch HTML screens inside an iframe
 * Maintains exact Stitch design fidelity — NO modifications to the HTML
 */
export default function StitchScreen({ desktopSrc, mobileSrc, title }) {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const updateIframeHeight = () => {
      if (iframeRef.current) {
        try {
          const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
          if (doc && doc.body) {
            iframeRef.current.style.height = doc.body.scrollHeight + 'px';
          }
        } catch (e) {
          // Cross-origin safety
        }
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', updateIframeHeight);
      return () => iframe.removeEventListener('load', updateIframeHeight);
    }
  }, []);

  // Determine which source to use based on viewport
  const getSource = () => {
    if (typeof window === 'undefined') return desktopSrc;
    return window.innerWidth < 768 && mobileSrc ? mobileSrc : desktopSrc;
  };

  return (
    <div ref={containerRef} className="stitch-screen-container">
      <iframe
        ref={iframeRef}
        src={getSource()}
        title={title || 'PulseGuard Screen'}
        style={{
          width: '100%',
          minHeight: '100vh',
          border: 'none',
          overflow: 'hidden',
        }}
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}
