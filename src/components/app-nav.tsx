'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Insights' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/income', label: 'Income' },
  { href: '/export', label: 'Export' },
];

export function AppNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-2xl justify-around border-t bg-white">
      {items.map((it) => {
        const active = it.href === '/' ? path === '/' : path.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href}
            className={`flex-1 py-3 text-center text-sm ${active ? 'font-semibold text-black' : 'text-gray-500'}`}>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
