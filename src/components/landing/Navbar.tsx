'use client';

import { Logo } from '@/components/icons/Logo';
import { UpgradeCTA } from '@/components/upgrade';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { LayoutDashboard, LogOut, Menu, Settings, X } from 'lucide-react';
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

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  if (!mounted) return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 transition-all duration-500 border-none z-[999] ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl shadow-sm h-20'
          : 'bg-transparent h-28'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-4 active:scale-95 transition-transform group">
          <div className={`p-2 rounded-xl transition-colors ${isScrolled ? 'bg-primary/10' : 'bg-foreground/5'}`}>
            <Logo size={isScrolled ? 32 : 40} />
          </div>
          <span className="text-2xl font-black tracking-tighter hidden sm:block uppercase text-foreground">
            <span className='italic'>Ease</span><span className="text-primary italic">Inventory</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-primary transition-all duration-300 relative group py-2 text-foreground/60 hover:text-foreground"
            >
              {link.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          {/* Theme Switch */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm">{theme === 'dark' ? '🌙' : '☀️'}</span>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            />
          </div>

          {isAuthenticated ? (
            <>
              <div className="hidden md:flex">
                <UpgradeCTA />
              </div>
              <Button
                asChild
                variant="secondary"
                className="hidden md:flex font-black text-[10px] uppercase tracking-widest"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="ring-2 ring-primary ring-offset-2 ring-offset-background transition-transform hover:scale-105 h-8 w-8">
                      <AvatarImage src={user?.image} alt={user?.name || 'User'} />
                      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-2">
                    <p className="font-bold">{user?.name || 'User'}</p>
                    <p className="text-xs text-foreground/50">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => signOut()}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="hidden md:flex font-black text-[10px] uppercase tracking-widest hover:bg-foreground/5 text-foreground"
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                asChild
                className="font-black px-8 h-12 shadow-xl shadow-primary/20 uppercase tracking-widest text-[10px] rounded-full"
              >
                <Link href="/register">Join Free</Link>
              </Button>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-background/98 backdrop-blur-2xl pt-12 px-4 border-t border-foreground/5 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Interface Mode</span>
            <div className="flex items-center gap-2">
              <span>☀️</span>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
              <span>🌙</span>
            </div>
          </div>
          <div className="space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-full text-4xl font-black hover:text-primary transition-all py-4 block text-foreground active:scale-95 origin-left uppercase tracking-tighter"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-12 flex flex-col gap-6">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="ring-2 ring-primary h-12 w-12">
                    <AvatarImage src={user?.image} alt={user?.name || 'User'} />
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg">{user?.name || 'User'}</p>
                    <p className="text-sm text-foreground/50">{user?.email}</p>
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full font-black h-20 text-xl shadow-2xl shadow-primary/30 text-white uppercase tracking-widest rounded-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="w-6 h-6 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full font-black h-16 text-lg border-destructive/30 text-destructive uppercase tracking-widest rounded-full"
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="w-full font-black h-20 text-xl border-foreground/10 text-foreground uppercase tracking-widest rounded-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/login">System Login</Link>
                </Button>
                <Button
                  asChild
                  className="w-full font-black h-20 text-xl shadow-2xl shadow-primary/30 text-white uppercase tracking-widest rounded-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/register">Initialize</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
