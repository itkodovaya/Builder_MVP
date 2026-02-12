'use client';

import { LAYOUT_OPTIONS } from '@/config/enums';
import { atom, useAtom } from 'jotai';
import { useEffect, useState } from 'react';

// 1. set initial atom for isomorphic layout
// Use null initially to avoid hydration mismatch, then set on client
const isomorphicLayoutAtom = atom<string | null>(null);

const isomorphicLayoutAtomWithPersistence = atom(
  (get) => get(isomorphicLayoutAtom),
  (get, set, newStorage: any) => {
    set(isomorphicLayoutAtom, newStorage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isomorphic-layout', newStorage);
    }
  }
);

// 2. useLayout hook to check which layout is available
export function useLayout() {
  const [layout, setLayout] = useAtom(isomorphicLayoutAtomWithPersistence);
  const [isClient, setIsClient] = useState(false);

  // Initialize layout from localStorage on client side only
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('isomorphic-layout');
      let finalLayout = stored || LAYOUT_OPTIONS.HELIUM;
      
      // If stored layout is HYDROGEN (old default), switch to HELIUM for regular users
      if (stored === LAYOUT_OPTIONS.HYDROGEN) {
        finalLayout = LAYOUT_OPTIONS.HELIUM;
        localStorage.setItem('isomorphic-layout', LAYOUT_OPTIONS.HELIUM);
      }
      
      if (layout !== finalLayout) {
        setLayout(finalLayout);
      }
    }
  }, [layout, setLayout]);
  
  // Return HELIUM as default for server-side rendering and before client hydration
  const currentLayout = isClient 
    ? (layout === null || layout === LAYOUT_OPTIONS.HYDROGEN ? LAYOUT_OPTIONS.HELIUM : layout)
    : LAYOUT_OPTIONS.HELIUM;
  
  return {
    layout: currentLayout,
    setLayout,
  };
}
