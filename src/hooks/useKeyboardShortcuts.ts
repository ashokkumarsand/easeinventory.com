'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  category: 'navigation' | 'actions' | 'global';
}

// Chord shortcuts (e.g., G then I for Go to Inventory)
interface ChordConfig {
  first: string;
  second: string;
  action: () => void;
  description: string;
  category: 'navigation' | 'actions';
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const [pendingChord, setPendingChord] = useState<string | null>(null);
  const chordTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Navigation shortcuts (G + key)
  const navigationChords: ChordConfig[] = [
    { first: 'g', second: 'd', action: () => router.push('/dashboard'), description: 'Go to Dashboard', category: 'navigation' },
    { first: 'g', second: 'i', action: () => router.push('/inventory'), description: 'Go to Inventory', category: 'navigation' },
    { first: 'g', second: 's', action: () => router.push('/suppliers'), description: 'Go to Suppliers', category: 'navigation' },
    { first: 'g', second: 'r', action: () => router.push('/repairs'), description: 'Go to Repairs', category: 'navigation' },
    { first: 'g', second: 'b', action: () => router.push('/invoices'), description: 'Go to Invoices/Billing', category: 'navigation' },
    { first: 'g', second: 'a', action: () => router.push('/analytics'), description: 'Go to Analytics', category: 'navigation' },
    { first: 'g', second: 'l', action: () => router.push('/inventory/locations'), description: 'Go to Locations', category: 'navigation' },
    { first: 'g', second: 't', action: () => router.push('/team'), description: 'Go to Team', category: 'navigation' },
    { first: 'g', second: 'h', action: () => router.push('/hr'), description: 'Go to HR', category: 'navigation' },
    { first: 'g', second: ',', action: () => router.push('/settings'), description: 'Go to Settings', category: 'navigation' },
  ];

  // Action shortcuts (N + key for New)
  const actionChords: ChordConfig[] = [
    { first: 'n', second: 'p', action: () => router.push('/inventory?action=new'), description: 'New Product', category: 'actions' },
    { first: 'n', second: 's', action: () => router.push('/suppliers?action=new'), description: 'New Supplier', category: 'actions' },
    { first: 'n', second: 'i', action: () => router.push('/invoices?action=new'), description: 'New Invoice', category: 'actions' },
    { first: 'n', second: 'r', action: () => router.push('/repairs?action=new'), description: 'New Repair', category: 'actions' },
    { first: 'n', second: 't', action: () => router.push('/inventory/transfers?action=new'), description: 'New Transfer', category: 'actions' },
  ];

  const allChords = [...navigationChords, ...actionChords];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable ||
                    target.closest('[role="dialog"]') ||
                    target.closest('[cmdk-root]');

    if (isInput) return;

    const key = e.key.toLowerCase();

    // Handle chord shortcuts
    if (pendingChord) {
      // Clear timeout
      if (chordTimeoutRef.current) {
        clearTimeout(chordTimeoutRef.current);
      }

      // Find matching chord
      const chord = allChords.find(c => c.first === pendingChord && c.second === key);
      if (chord) {
        e.preventDefault();
        chord.action();
      }

      setPendingChord(null);
      return;
    }

    // Start chord sequence for g or n
    if (key === 'g' || key === 'n') {
      e.preventDefault();
      setPendingChord(key);

      // Auto-clear after 1.5 seconds
      chordTimeoutRef.current = setTimeout(() => {
        setPendingChord(null);
      }, 1500);
      return;
    }

    // Single key shortcuts
    // / - Focus search
    if (key === '/' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }

    // ? - Show keyboard shortcuts help
    if (key === '?' && e.shiftKey) {
      e.preventDefault();
      // TODO: Open shortcuts modal
      console.log('Show shortcuts help');
    }

    // Escape - Close modals, clear selection
    if (key === 'escape') {
      // Let other handlers deal with this
    }
  }, [pendingChord, allChords]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (chordTimeoutRef.current) {
        clearTimeout(chordTimeoutRef.current);
      }
    };
  }, [handleKeyDown]);

  return {
    pendingChord,
    shortcuts: {
      navigation: navigationChords,
      actions: actionChords,
    },
  };
}

// Shortcut display component helper
export function formatShortcut(first: string, second?: string): string {
  const f = first.toUpperCase();
  if (second) {
    return `${f} → ${second.toUpperCase()}`;
  }
  return f;
}

// Get shortcut for a route
export function getShortcutForRoute(path: string): string | null {
  const shortcuts: Record<string, string> = {
    '/dashboard': 'G → D',
    '/inventory': 'G → I',
    '/suppliers': 'G → S',
    '/repairs': 'G → R',
    '/invoices': 'G → B',
    '/analytics': 'G → A',
    '/inventory/locations': 'G → L',
    '/team': 'G → T',
    '/hr': 'G → H',
    '/settings': 'G → ,',
  };
  return shortcuts[path] || null;
}

export default useKeyboardShortcuts;
