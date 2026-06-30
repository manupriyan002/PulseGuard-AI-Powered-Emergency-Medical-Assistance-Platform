'use client';

import Script from 'next/script';

/**
 * Shared Stitch Design System configuration.
 * Injects Tailwind CDN + Clinical Matte Luxury design tokens.
 */
export default function StitchConfig() {
  return (
    <>
      <Script src="https://cdn.tailwindcss.com?plugins=forms,container-queries" strategy="beforeInteractive" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <Script id="stitch-tailwind-config" strategy="beforeInteractive">
        {`
          if (typeof tailwind !== 'undefined') {
            tailwind.config = {
              darkMode: "class",
              theme: {
                extend: {
                  "colors": {
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
                  "borderRadius":{"DEFAULT":"1rem","lg":"2rem","xl":"3rem","full":"9999px"},
                  "spacing":{"unit":"8px","container-padding":"40px","stack-lg":"48px","gutter":"24px","stack-sm":"12px","stack-md":"24px"},
                  "fontFamily":{"headline-md":["Inter"],"label-sm":["Inter"],"headline-xl":["Inter"],"body-md":["Inter"],"body-lg":["Inter"],"headline-lg":["Inter"]},
                  "fontSize":{
                    "headline-md":["24px",{"lineHeight":"1.4","fontWeight":"600"}],
                    "label-sm":["13px",{"lineHeight":"1.2","letterSpacing":"0.05em","fontWeight":"600"}],
                    "headline-xl":["64px",{"lineHeight":"1.1","letterSpacing":"-0.02em","fontWeight":"700"}],
                    "body-md":["16px",{"lineHeight":"1.6","fontWeight":"400"}],
                    "body-lg":["18px",{"lineHeight":"1.6","fontWeight":"400"}],
                    "headline-lg":["40px",{"lineHeight":"1.2","letterSpacing":"-0.01em","fontWeight":"700"}]
                  }
                }
              }
            }
          }
        `}
      </Script>
      <style jsx global>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .matte-card {
          background-color: #ffffff;
          border-radius: 2rem;
          box-shadow: 0 40px 60px rgba(0,0,0,0.04);
          padding: 32px;
        }
        .embossed-icon {
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.05);
        }
      `}</style>
    </>
  );
}
