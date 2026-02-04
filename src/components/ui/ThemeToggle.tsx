'use client';

import { Button, Tooltip } from '@heroui/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button isIconOnly variant="light" radius="full" isDisabled>
        <Sun size={20} className="opacity-50" />
      </Button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <Tooltip content={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <Button
        isIconOnly
        variant="light"
        radius="full"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="transition-transform hover:scale-110"
      >
        {isDark ? (
          <Sun size={20} className="text-yellow-400" />
        ) : (
          <Moon size={20} className="text-slate-600" />
        )}
      </Button>
    </Tooltip>
  );
}
