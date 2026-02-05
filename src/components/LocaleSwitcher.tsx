'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Globe, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

const locales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' }
];

export default function LocaleSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onAction(key: React.Key) {
    const nextLocale = key as string;
    
    // Set cookie and refresh
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
      router.refresh();
    });
  }

  const currentLocale = typeof document !== 'undefined' 
    ? document.cookie.split('; ').find(row => row.startsWith('NEXT_LOCALE='))?.split('=')[1] || 'en'
    : 'en';

  const currentLanguage = locales.find(l => l.code === currentLocale) || locales[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={`Change language - currently ${currentLanguage.name}`}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 size={20} className="opacity-50 animate-spin" aria-hidden="true" />
          ) : (
            <Globe size={20} className="opacity-50" aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => onAction(locale.code)}
            className={currentLocale === locale.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{locale.flag}</span>
            {locale.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
