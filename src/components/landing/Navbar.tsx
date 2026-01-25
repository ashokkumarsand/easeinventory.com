'use client';

import { Logo } from '@/components/icons/Logo';
import {
    Button,
    Navbar as HeroNavbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
    Switch,
} from '@heroui/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#faq', label: 'FAQ' },
  ];

  if (!mounted) return null;

  return (
    <HeroNavbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className={`fixed top-0 transition-all duration-500 border-none z-[1000] ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-md shadow-sm h-16'
          : 'bg-transparent h-24'
      }`}
      maxWidth="xl"
      position="sticky"
    >
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <Logo size={isScrolled ? 36 : 44} />
            <span className={`text-xl font-bold tracking-tight hidden sm:block ${
              theme === 'dark' ? 'text-white' : 'text-dark'
            }`}>
              Ease<span className="text-primary">Inventory</span>
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden lg:flex gap-10" justify="center">
        {navLinks.map((link) => (
          <NavbarItem key={link.href}>
            <Link
              href={link.href}
              className="text-sm font-semibold hover:text-primary transition-all duration-300 relative group py-1"
            >
              {link.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-5">
        <NavbarItem className="hidden sm:flex items-center">
          <Switch
            isSelected={theme === 'dark'}
            size="sm"
            color="secondary"
            onValueChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            startContent={<span className="text-[10px]">🌙</span>}
            endContent={<span className="text-[10px]">☀️</span>}
          />
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <Button
            as={Link}
            href="/login"
            variant="light"
            className="font-bold hover:bg-black/5 dark:hover:bg-white/5"
          >
            Log In
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            as={Link}
            href="/register"
            color="primary"
            className="font-bold px-6 shadow-xl shadow-primary/20"
            radius="full"
          >
            Join Free
          </Button>
        </NavbarItem>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="lg:hidden"
        />
      </NavbarContent>

      <NavbarMenu className="bg-background/95 backdrop-blur-xl pt-10 gap-6">
        <div className="flex justify-between items-center mb-6">
           <span className="text-sm font-medium">Appearance</span>
           <Switch
            isSelected={theme === 'dark'}
            size="md"
            color="secondary"
            onValueChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            startContent={<span>🌙</span>}
            endContent={<span>☀️</span>}
          />
        </div>
        {navLinks.map((link) => (
          <NavbarMenuItem key={link.href}>
            <Link
              href={link.href}
              className="w-full text-2xl font-bold hover:text-primary transition-colors py-2 block"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem className="pt-8 flex flex-col gap-4">
          <Button
            as={Link}
            href="/login"
            variant="bordered"
            className="w-full font-bold h-14 text-lg"
            radius="full"
            onClick={() => setIsMenuOpen(false)}
          >
            Log In
          </Button>
          <Button
            as={Link}
            href="/register"
            color="primary"
            className="w-full font-bold h-14 text-lg shadow-xl shadow-primary/20"
            radius="full"
            onClick={() => setIsMenuOpen(false)}
          >
            Get Started
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </HeroNavbar>
  );
};

export default Navbar;
