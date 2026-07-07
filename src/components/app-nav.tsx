'use client';

import Link from 'next/link';
import { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const items: NavItem[] = [
  {
    href: '/',
    label: 'Insights',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
        <path d="M3 13h8V3H3zM13 21h8V3h-8zM3 21h8v-6H3z" />
      </svg>
    ),
  },
  {
    href: '/expenses',
    label: 'Expenses',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
        <path d="M4 4h16v14H4z" />
        <path d="M4 9h16" />
      </svg>
    ),
  },
  {
    href: '/income',
    label: 'Income',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
        <path d="M12 1v22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: '/export',
    label: 'Export',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
        <path d="M12 3v12" />
        <path d="M8 11l4 4 4-4" />
        <path d="M4 21h16" />
      </svg>
    ),
  },
];

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
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

function DesktopIcon({ icon }: { icon: React.ReactNode }) {
  const { pending } = useLinkStatus();
  if (pending) {
    return <Spinner className="h-[18px] w-[18px]" />;
  }
  return <>{icon}</>;
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar nav */}
      <nav className="hidden md:flex md:flex-col md:gap-[3px]">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={`flex items-center gap-[11px] rounded-[9px] px-[10px] py-[9px] text-sm font-medium no-underline transition-colors ${
                active ? 'bg-accent-soft text-accent-ink' : 'text-muted hover:bg-canvas'
              }`}
            >
              <PendingSignal />
              <span className={active ? 'text-accent' : 'text-faint'}>
                <DesktopIcon icon={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-hair bg-paper pb-[env(safe-area-inset-bottom)] md:hidden">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={`flex flex-1 flex-col items-center gap-[3px] py-[9px] pb-3 text-[10px] font-semibold no-underline ${
                active ? 'text-accent' : 'text-faint'
              }`}
            >
              <PendingSignal />
              <DesktopIcon icon={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
