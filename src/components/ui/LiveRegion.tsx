'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface Announcement {
  message: string;
  priority: 'polite' | 'assertive';
  id: string;
}

interface LiveRegionContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const LiveRegionContext = createContext<LiveRegionContextType | null>(null);

/**
 * Provider component for screen reader announcements
 * Wrap your app with this to enable announcements
 */
export function LiveRegionProvider({ children }: { children: React.ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const id = `announcement-${Date.now()}`;
    setAnnouncements((prev) => [...prev, { message, priority, id }]);

    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }, 1000);
  }, []);

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}

      {/* Polite announcements (wait for current speech to finish) */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter((a) => a.priority === 'polite')
          .map((a) => (
            <span key={a.id}>{a.message}</span>
          ))}
      </div>

      {/* Assertive announcements (interrupt current speech) */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter((a) => a.priority === 'assertive')
          .map((a) => (
            <span key={a.id}>{a.message}</span>
          ))}
      </div>
    </LiveRegionContext.Provider>
  );
}

/**
 * Hook to announce messages to screen readers
 */
export function useAnnounce() {
  const context = useContext(LiveRegionContext);

  if (!context) {
    // Return a no-op if not wrapped in provider
    return {
      announce: (message: string, priority?: 'polite' | 'assertive') => {
        console.warn('LiveRegionProvider not found. Announcement not made:', message);
      },
    };
  }

  return context;
}

/**
 * Component for inline live region
 * Use for dynamic content that changes
 */
export function LiveRegion({
  children,
  priority = 'polite',
  atomic = true,
}: {
  children: React.ReactNode;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
}) {
  return (
    <div
      role={priority === 'assertive' ? 'alert' : 'status'}
      aria-live={priority}
      aria-atomic={atomic}
    >
      {children}
    </div>
  );
}

/**
 * Visually hidden but accessible to screen readers
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
