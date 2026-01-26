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
      className={`fixed top-0 transition-all duration-500 border-none z-[999] ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl shadow-sm h-20'
          : 'bg-transparent h-28'
      }`}
      maxWidth="xl"
      position="sticky"
    >
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-4 active:scale-95 transition-transform group">
            <div className={`p-2 rounded-xl transition-colors ${isScrolled ? 'bg-primary/10' : 'bg-foreground/5'}`}>
              <Logo size={isScrolled ? 32 : 40} />
            </div>
            <span className="text-2xl font-black tracking-tighter hidden sm:block uppercase text-foreground">
              Ease<span className="text-primary italic">Inventory</span>
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden lg:flex gap-12" justify="center">
        {navLinks.map((link) => (
          <NavbarItem key={link.href}>
            <Link
              href={link.href}
              className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-primary transition-all duration-300 relative group py-2 text-foreground/60 hover:text-foreground"
            >
              {link.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-6">
        <NavbarItem className="hidden sm:flex items-center">
          <Switch
            isSelected={theme === 'dark'}
            color="secondary"
            onValueChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            startContent={<span className="text-[10px]">🌙</span>}
            endContent={<span className="text-[10px]">☀️</span>}
            classNames={{
              wrapper: "bg-foreground/10",
            }}
          />
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <Button
            as={Link}
            href="/login"
            variant="light"
            className="font-black text-[10px] uppercase tracking-widest hover:bg-foreground/5 text-foreground"
          >
            Log In
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            as={Link}
            href="/register"
            color="primary"
            className="font-black px-8 h-12 shadow-xl shadow-primary/20 uppercase tracking-widest text-[10px]"
            radius="full"
          >
            Join Free
          </Button>
        </NavbarItem>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="lg:hidden text-foreground"
        />
      </NavbarContent>

      <NavbarMenu className="bg-background/98 backdrop-blur-2xl pt-12 gap-8 border-t border-foreground/5">
        <div className="flex justify-between items-center mb-8 px-4">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Interface Mode</span>
           <Switch
            isSelected={theme === 'dark'}
            size="lg"
            color="secondary"
            onValueChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            startContent={<div className="scale-110">🌙</div>}
            endContent={<div className="scale-110">☀️</div>}
          />
        </div>
        {navLinks.map((link) => (
          <NavbarMenuItem key={link.href} className="px-4">
            <Link
              href={link.href}
              className="w-full text-4xl font-black hover:text-primary transition-all py-4 block text-foreground active:scale-95 origin-left uppercase tracking-tighter"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem className="pt-12 px-4 flex flex-col gap-6">
          <Button
            as={Link}
            href="/login"
            variant="bordered"
            className="w-full font-black h-20 text-xl border-foreground/10 text-foreground uppercase tracking-widest"
            radius="full"
            onClick={() => setIsMenuOpen(false)}
          >
            System Login
          </Button>
          <Button
            as={Link}
            href="/register"
            color="primary"
            className="w-full font-black h-20 text-xl shadow-2xl shadow-primary/30 text-white uppercase tracking-widest"
            radius="full"
            onClick={() => setIsMenuOpen(false)}
          >
            Initialize
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </HeroNavbar>
  );
};

export default Navbar;
