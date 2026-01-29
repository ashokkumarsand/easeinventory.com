'use client';

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger
} from '@heroui/react';
import { Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

const locales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
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
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button 
          variant="light" 
          radius="full" 
          isIconOnly
          isLoading={isPending}
        >
          <Globe size={20} className="opacity-50" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="Language selection" 
        selectedKeys={[currentLocale]}
        onAction={onAction}
      >
        {locales.map((locale) => (
          <DropdownItem key={locale.code} startContent={<span>{locale.flag}</span>}>
            {locale.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
