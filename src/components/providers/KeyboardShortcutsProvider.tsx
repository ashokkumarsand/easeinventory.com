'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { createContext, useContext, useEffect, useState } from 'react';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsContextValue {
  pendingChord: string | null;
  shortcuts: {
    navigation: Array<{ first: string; second: string; description: string }>;
    actions: Array<{ first: string; second: string; description: string }>;
  };
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | null>(null);

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider');
  }
  return context;
}

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const { pendingChord, shortcuts } = useKeyboardShortcuts();

  return (
    <KeyboardShortcutsContext.Provider value={{ pendingChord, shortcuts }}>
      {children}
      {/* Chord indicator */}
      <ChordIndicator pendingChord={pendingChord} />
    </KeyboardShortcutsContext.Provider>
  );
}

// Visual indicator showing pending chord
function ChordIndicator({ pendingChord }: { pendingChord: string | null }) {
  return (
    <AnimatePresence>
      {pendingChord && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className="flex items-center gap-3 px-5 py-3 bg-foreground text-background rounded-2xl shadow-2xl">
            <kbd className="px-3 py-1.5 text-lg font-bold bg-background/20 rounded-lg uppercase">
              {pendingChord}
            </kbd>
            <span className="text-sm font-medium opacity-70">
              {pendingChord === 'g' ? 'Go to...' : pendingChord === 'n' ? 'New...' : 'Press next key'}
            </span>
            <div className="flex items-center gap-1 ml-2 text-xs opacity-50">
              {pendingChord === 'g' && (
                <>
                  <kbd className="px-1.5 py-0.5 bg-background/10 rounded">D</kbd>
                  <kbd className="px-1.5 py-0.5 bg-background/10 rounded">I</kbd>
                  <kbd className="px-1.5 py-0.5 bg-background/10 rounded">S</kbd>
                  <span>...</span>
                </>
              )}
              {pendingChord === 'n' && (
                <>
                  <kbd className="px-1.5 py-0.5 bg-background/10 rounded">P</kbd>
                  <kbd className="px-1.5 py-0.5 bg-background/10 rounded">I</kbd>
                  <kbd className="px-1.5 py-0.5 bg-background/10 rounded">R</kbd>
                  <span>...</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default KeyboardShortcutsProvider;
