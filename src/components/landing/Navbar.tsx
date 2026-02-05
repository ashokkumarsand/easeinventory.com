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
import {
  ArrowRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const user = session?.user as any;

  const navLinks = [
    { href: '#features', label: 'Features', id: 'features' },
    { href: '#how-it-works', label: 'How It Works', id: 'how-it-works' },
    { href: '#pricing', label: 'Pricing', id: 'pricing' },
    { href: '#faq', label: 'FAQ', id: 'faq' },
  ];

  // Scroll spy for active section
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);

    // Find active section
    const sections = navLinks.map((link) => document.getElementById(link.id));
    const scrollPosition = window.scrollY + 100;

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section && section.offsetTop <= scrollPosition) {
        setActiveSection(navLinks[i].id);
        return;
      }
    }
    setActiveSection('');
  }, []);

  useEffect(() => {
    setMounted(true);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const getInitials = (name: string) => {
    return (
      name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U'
    );
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setIsMenuOpen(false);
  };

  if (!mounted) return null;

  return (
    <>
      <nav
        className={`glass-navbar fixed top-0 left-0 right-0 z-[999] transition-all duration-500 ${
          isScrolled ? 'scrolled py-3' : 'py-5'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
            >
              <div
                className={`p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 ${
                  isScrolled ? 'scale-90' : 'scale-100'
                }`}
              >
                <Logo size={isScrolled ? 28 : 32} />
              </div>
              <span className="text-xl font-black tracking-tight hidden sm:block">
                <span className="italic text-foreground">Ease</span>
                <span className="text-primary italic">Inventory</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className={`nav-link px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-300 ${
                    activeSection === link.id
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                  }`}
                  aria-current={activeSection === link.id ? 'page' : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-foreground/70" />
                ) : (
                  <Moon className="w-4 h-4 text-foreground/70" />
                )}
              </button>

              {isAuthenticated ? (
                <>
                  {/* Upgrade CTA for authenticated users */}
                  <div className="hidden md:flex">
                    <UpgradeCTA />
                  </div>

                  {/* Dashboard Button */}
                  <Button
                    asChild
                    className="hidden md:flex btn-glow font-semibold text-xs uppercase tracking-wider h-10 px-5 rounded-xl"
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>

                  {/* User Avatar Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full">
                        <Avatar className="ring-2 ring-primary/50 ring-offset-2 ring-offset-background transition-transform hover:scale-105 h-9 w-9">
                          <AvatarImage src={user?.image} alt={user?.name || 'User'} />
                          <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                            {getInitials(user?.name)}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-background/95 backdrop-blur-xl border-foreground/10"
                    >
                      <div className="px-3 py-2">
                        <p className="font-semibold text-sm">{user?.name || 'User'}</p>
                        <p className="text-xs text-foreground/50 truncate">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator className="bg-foreground/10" />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center cursor-pointer">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center cursor-pointer">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-foreground/10" />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => signOut()}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  {/* Sign In - Ghost button */}
                  <Button
                    asChild
                    variant="ghost"
                    className="hidden md:flex font-semibold text-xs uppercase tracking-wider h-10 px-4 hover:bg-foreground/5"
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>

                  {/* Create Account - Primary CTA with glow */}
                  <Button
                    asChild
                    className="btn-glow font-semibold text-xs uppercase tracking-wider h-10 px-5 rounded-xl"
                  >
                    <Link href="/register" className="flex items-center gap-2">
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-[998] transition-all duration-500 ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/95 backdrop-blur-2xl"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Content */}
        <div
          className={`absolute inset-x-0 top-[72px] bottom-0 px-6 py-8 overflow-y-auto transition-transform duration-500 ${
            isMenuOpen ? 'translate-y-0' : '-translate-y-8'
          }`}
        >
          {/* Theme Toggle */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-foreground/10">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Appearance
            </span>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-all"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">Light</span>
                </>
              )}
            </button>
          </div>

          {/* Nav Links */}
          <nav className="space-y-2 mb-8">
            {navLinks.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`block px-4 py-4 text-2xl font-bold rounded-2xl transition-all duration-300 ${
                  activeSection === link.id
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground hover:bg-foreground/5'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Auth Actions */}
          <div className="space-y-4 pt-6 border-t border-foreground/10">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-foreground/5">
                  <Avatar className="ring-2 ring-primary/50 h-14 w-14">
                    <AvatarImage src={user?.image} alt={user?.name || 'User'} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg truncate">{user?.name || 'User'}</p>
                    <p className="text-sm text-foreground/50 truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Dashboard Button */}
                <Button
                  asChild
                  className="w-full btn-glow font-semibold text-base h-14 rounded-2xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/dashboard" className="flex items-center justify-center gap-2">
                    <LayoutDashboard className="w-5 h-5" />
                    Go to Dashboard
                  </Link>
                </Button>

                {/* Sign Out */}
                <Button
                  variant="outline"
                  className="w-full font-semibold text-base h-14 rounded-2xl border-foreground/10 text-foreground/70 hover:text-destructive hover:border-destructive/30"
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                {/* Create Account - Primary */}
                <Button
                  asChild
                  className="w-full btn-glow font-semibold text-base h-14 rounded-2xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/register" className="flex items-center justify-center gap-2">
                    Create Free Account
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>

                {/* Sign In - Secondary */}
                <Button
                  asChild
                  variant="outline"
                  className="w-full font-semibold text-base h-14 rounded-2xl border-foreground/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/login">Sign In to Existing Account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
