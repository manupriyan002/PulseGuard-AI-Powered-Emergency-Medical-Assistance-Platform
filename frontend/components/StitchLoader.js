'use client';

import { useEffect, useState } from 'react';

/**
 * Loads Tailwind CDN + Stitch design tokens dynamically.
 * Must be used in layouts that wrap Stitch-styled pages.
 */
export default function StitchLoader({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Skip if already loaded
    if (window.__stitchLoaded) { setReady(true); return; }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
          console.error('Service worker registration failed', err);
        });
      });
    }

    // 1. Load Material Symbols font
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // 2. Load Tailwind CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
    script.onload = () => {
      // 3. Configure Tailwind with Stitch tokens
      if (window.tailwind) {
        window.tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              colors: {
                "on-error":"#ffffff","surface-container":"#eeeeec","primary-fixed":"#95f8a7",
                "on-secondary-fixed":"#092009","secondary-fixed-dim":"#b1cfaa","on-primary-fixed":"#00210a",
                "primary-fixed-dim":"#79db8d","on-background":"#1a1c1b","outline":"#6f7a6e",
                "error-container":"#ffdad6","inverse-primary":"#79db8d","on-secondary-fixed-variant":"#344d31",
                "tertiary-fixed-dim":"#afceba","surface-container-high":"#e8e8e6","on-tertiary":"#ffffff",
                "secondary-fixed":"#cdebc5","on-surface":"#1a1c1b","on-error-container":"#93000a",
                "inverse-on-surface":"#f1f1ef","outline-variant":"#becabc","surface-container-highest":"#e2e3e1",
                "surface-container-low":"#f4f4f2","primary":"#00652c","on-secondary-container":"#516b4d",
                "surface":"#f9f9f7","background":"#f9f9f7","on-primary":"#ffffff","primary-container":"#15803d",
                "error":"#ba1a1a","on-primary-fixed-variant":"#005323","on-secondary":"#ffffff",
                "on-surface-variant":"#3f493f","surface-dim":"#dadad8","tertiary-fixed":"#caead6",
                "surface-variant":"#e2e3e1","surface-tint":"#006d30","tertiary-container":"#597665",
                "inverse-surface":"#2f3130","surface-container-lowest":"#ffffff","surface-bright":"#f9f9f7",
                "tertiary":"#415d4d","on-tertiary-fixed-variant":"#314d3e","on-tertiary-container":"#dcfce7",
                "on-tertiary-fixed":"#042014","secondary-container":"#cdebc5","secondary":"#4b6547",
                "on-primary-container":"#d3ffd5"
              },
              borderRadius: { DEFAULT: "1rem", lg: "2rem", xl: "3rem", full: "9999px" },
              spacing: { unit: "8px", "container-padding": "40px", "stack-lg": "48px", gutter: "24px", "stack-sm": "12px", "stack-md": "24px" },
              fontFamily: { "headline-md": ["Inter"], "label-sm": ["Inter"], "headline-xl": ["Inter"], "body-md": ["Inter"], "body-lg": ["Inter"], "headline-lg": ["Inter"] },
              fontSize: {
                "headline-md": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
                "label-sm": ["13px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "600" }],
                "headline-xl": ["64px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
                "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
                "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
                "headline-lg": ["40px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }]
              }
            }
          }
        };
      }
      window.__stitchLoaded = true;
      setReady(true);
    };
    document.head.appendChild(script);
  }, []);

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f7', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#00652c', marginBottom: 8 }}>PulseGuard</div>
          <div style={{ color: '#6f7a6e' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return children;
}
