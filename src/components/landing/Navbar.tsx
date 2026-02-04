'use client';

import { Logo } from '@/components/icons/Logo';
import { UpgradeCTA } from '@/components/upgrade';
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Switch,
} from '@heroui/react';
import { LayoutDashboard, LogOut, Settings, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const user = session?.user as any;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/#features', label: 'Features' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/#faq', label: 'FAQ' },
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
              <span className='italic'>Ease</span><span className="text-primary italic">Inventory</span>
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
            size="md"
            color="secondary"
            onValueChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            thumbIcon={({ isSelected, className }) =>
               isSelected ? (
                 <span className={className}>🌙</span>
               ) : (
                 <span className={className}>☀️</span>
               )
            }
            classNames={{
              wrapper: "bg-foreground/20 group-data-[selected=true]:bg-secondary/20 h-8 w-14",
              thumb: "shadow-md group-data-[selected=true]:bg-secondary group-data-[selected=false]:bg-white w-6 h-6 group-data-[selected=true]:ml-6",
            }}
          />
        </NavbarItem>

        {isAuthenticated ? (
          <>
            <NavbarItem className="hidden md:flex">
              <UpgradeCTA />
            </NavbarItem>
            <NavbarItem className="hidden md:flex">
              <Button
                as={Link}
                href="/dashboard"
                color="primary"
                variant="flat"
                className="font-black text-[10px] uppercase tracking-widest"
                startContent={<LayoutDashboard className="w-4 h-4" />}
              >
                Dashboard
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    as="button"
                    name={user?.name || 'User'}
                    src={user?.image}
                    size="sm"
                    className="ring-2 ring-primary ring-offset-2 ring-offset-background transition-transform hover:scale-105"
                  />
                </DropdownTrigger>
                <DropdownMenu variant="flat">
                  <DropdownItem
                    key="profile"
                    className="h-14 gap-2"
                    textValue="Profile info"
                  >
                    <p className="font-bold">{user?.name || 'User'}</p>
                    <p className="text-xs text-foreground/50">{user?.email}</p>
                  </DropdownItem>
                  <DropdownItem
                    key="dashboard"
                    as={Link}
                    href="/dashboard"
                    startContent={<LayoutDashboard className="w-4 h-4" />}
                  >
                    Dashboard
                  </DropdownItem>
                  <DropdownItem
                    key="settings"
                    as={Link}
                    href="/dashboard/settings"
                    startContent={<Settings className="w-4 h-4" />}
                  >
                    Settings
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    className="text-danger"
                    startContent={<LogOut className="w-4 h-4" />}
                    onClick={() => signOut()}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </>
        ) : (
          <>
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
          </>
        )}

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
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <Avatar
                  name={user?.name || 'User'}
                  src={user?.image}
                  size="lg"
                  className="ring-2 ring-primary"
                />
                <div>
                  <p className="font-bold text-lg">{user?.name || 'User'}</p>
                  <p className="text-sm text-foreground/50">{user?.email}</p>
                </div>
              </div>
              <Button
                as={Link}
                href="/dashboard"
                color="primary"
                className="w-full font-black h-20 text-xl shadow-2xl shadow-primary/30 text-white uppercase tracking-widest"
                radius="full"
                startContent={<LayoutDashboard className="w-6 h-6" />}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Button>
              <Button
                variant="bordered"
                className="w-full font-black h-16 text-lg border-danger/30 text-danger uppercase tracking-widest"
                radius="full"
                startContent={<LogOut className="w-5 h-5" />}
                onClick={() => {
                  setIsMenuOpen(false);
                  signOut();
                }}
              >
                Log Out
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </NavbarMenuItem>
      </NavbarMenu>
    </HeroNavbar>
  );
};

export default Navbar;
