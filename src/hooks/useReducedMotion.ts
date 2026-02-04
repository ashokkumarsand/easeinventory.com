'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect user's reduced motion preference
 * Returns true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to get animation settings based on reduced motion preference
 */
export function useAnimationSettings() {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion,
    // Framer Motion transition settings
    transition: prefersReducedMotion
      ? { duration: 0 }
      : { type: 'spring', stiffness: 300, damping: 30 },
    // Simple transitions
    duration: prefersReducedMotion ? 0 : 0.3,
    // Disable animations entirely
    animate: !prefersReducedMotion,
  };
}

/**
 * Hook to detect high contrast preference
 */
export function useHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersHighContrast;
}

/**
 * Hook to detect color scheme preference
 */
export function useColorScheme(): 'light' | 'dark' | null {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    setColorScheme(darkQuery.matches ? 'dark' : 'light');

    const handleChange = (event: MediaQueryListEvent) => {
      setColorScheme(event.matches ? 'dark' : 'light');
    };

    darkQuery.addEventListener('change', handleChange);

    return () => {
      darkQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return colorScheme;
}
