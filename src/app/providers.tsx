'use client';

import { HeroUIProvider } from '@heroui/react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useRouter } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <SessionProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <HeroUIProvider navigate={router.push}>
          {children}
        </HeroUIProvider>
      </NextThemesProvider>
    </SessionProvider>
  );
}
