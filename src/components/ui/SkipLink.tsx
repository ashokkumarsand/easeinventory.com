'use client';

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

/**
 * Skip link for keyboard users to bypass navigation
 * Becomes visible on focus
 */
export default function SkipLink({
  href = '#main-content',
  children = 'Skip to main content',
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-bold focus:text-sm focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-foreground"
    >
      {children}
    </a>
  );
}

/**
 * Multiple skip links for complex pages
 */
export function SkipLinks({
  links,
}: {
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-4 focus-within:left-4 focus-within:z-[9999] focus-within:flex focus-within:flex-col focus-within:gap-2 focus-within:p-4 focus-within:bg-background focus-within:rounded-lg focus-within:shadow-lg focus-within:border focus-within:border-foreground/10">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="px-3 py-2 text-sm font-bold rounded-md hover:bg-primary/10 focus:bg-primary focus:text-primary-foreground focus:outline-none"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
