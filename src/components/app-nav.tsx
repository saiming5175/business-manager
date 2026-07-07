'use client';

import Link from 'next/link';
import { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  Download,
  LogOut,
  ShoppingBag,
  Menu,
  X,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const NAV: NavItem[] = [
  { href: '/', label: 'Insights', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/income', label: 'Income', icon: TrendingUp },
  { href: '/export', label: 'Export', icon: Download },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

function Spinner({ className = '', size }: { className?: string; size: number }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      style={{ width: size, height: size }}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

/** Dispatches a global `navstart` event as soon as this link's navigation is pending. */
function PendingSignal() {
  const { pending } = useLinkStatus();
  useEffect(() => {
    if (pending) {
      window.dispatchEvent(new Event('navstart'));
    }
  }, [pending]);
  return null;
}

function NavIcon({ icon: Icon, size }: { icon: React.ElementType; size: number }) {
  const { pending } = useLinkStatus();
  if (pending) {
    return <Spinner size={size} />;
  }
  return <Icon size={size} />;
}

function SignOutButton({ className }: { className?: string }) {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/[0.05] transition-all',
          className
        )}
      >
        <LogOut size={16} />
        Sign out
      </button>
    </form>
  );
}

function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'w-6 h-6 rounded-md' : 'w-7 h-7 rounded-lg';
  const icon = size === 'sm' ? 12 : 14;
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn(box, 'bg-primary flex items-center justify-center')}>
        <ShoppingBag size={icon} className="text-white" />
      </div>
      <span className="font-semibold text-foreground text-sm">Business Manager</span>
    </div>
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-sidebar shrink-0">
      <div className="px-5 py-5 border-b border-border">
        <Logo />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              prefetch
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
              )}
            >
              <PendingSignal />
              <NavIcon icon={Icon} size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <SignOutButton />
      </div>
    </aside>
  );
}

export function MobileHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar shrink-0 relative">
      <Logo size="sm" />
      <button
        onClick={() => setMobileMenuOpen((v) => !v)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[52px] left-0 right-0 z-40 bg-sidebar border-b border-border shadow-2xl">
          <nav className="px-3 py-2 space-y-0.5">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  prefetch
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                  )}
                >
                  <PendingSignal />
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
            <SignOutButton />
          </nav>
        </div>
      )}
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden flex border-t border-border bg-sidebar shrink-0">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            prefetch
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-all',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <PendingSignal />
            <NavIcon icon={Icon} size={18} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
