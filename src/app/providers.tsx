'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import PWAProvider from '@/components/providers/PWAProvider';
import { LiveRegionProvider } from '@/components/ui/LiveRegion';
import SkipLink from '@/components/ui/SkipLink';
import { PlanProvider } from '@/contexts/PlanContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { UpgradeModal } from '@/components/upgrade';
import CommandPalette from '@/components/ui/CommandPalette';
import KeyboardShortcutsProvider from '@/components/providers/KeyboardShortcutsProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider attribute="class" defaultTheme="dark">
          <TooltipProvider delayDuration={300}>
            <PlanProvider>
              <CurrencyProvider>
                <LiveRegionProvider>
                  <KeyboardShortcutsProvider>
                    <PWAProvider>
                      <SkipLink href="#main-content" />
                      <main id="main-content" tabIndex={-1} className="outline-none">
                        {children}
                      </main>
                      <UpgradeModal />
                      <CommandPalette />
                      <Toaster richColors position="top-right" />
                    </PWAProvider>
                  </KeyboardShortcutsProvider>
                </LiveRegionProvider>
              </CurrencyProvider>
            </PlanProvider>
          </TooltipProvider>
        </NextThemesProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
