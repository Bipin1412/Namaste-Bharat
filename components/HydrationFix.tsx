'use client';

import { useEffect } from 'react';

export default function HydrationFix() {
  useEffect(() => {
    // Remove browser extension attributes that cause hydration mismatches
    const body = document.body;
    if (body) {
      // Remove Grammarly attributes
      body.removeAttribute('data-new-gr-c-s-check-loaded');
      body.removeAttribute('data-gr-ext-installed');

      // Remove other common extension attributes that might cause issues
      const extensionAttrs = [
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'data-grammarly-shadow-root',
        'data-grammarly-safari-telemetry'
      ];

      extensionAttrs.forEach(attr => {
        body.removeAttribute(attr);
      });
    }
  }, []);

  return null;
}