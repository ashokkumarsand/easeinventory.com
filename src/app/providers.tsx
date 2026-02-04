'use client';

import { HeroUIProvider } from '@heroui/react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useRouter } from 'next/navigation';
import PWAProvider from '@/components/providers/PWAProvider';
import { LiveRegionProvider } from '@/components/ui/LiveRegion';
import SkipLink from '@/components/ui/SkipLink';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <SessionProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <HeroUIProvider navigate={router.push}>
          <LiveRegionProvider>
            <PWAProvider>
              <SkipLink href="#main-content" />
              <main id="main-content" tabIndex={-1} className="outline-none">
                {children}
              </main>
            </PWAProvider>
          </LiveRegionProvider>
        </HeroUIProvider>
      </NextThemesProvider>
    </SessionProvider>
  );
}
