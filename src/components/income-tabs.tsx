'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useFilterNav } from './use-filter-nav';

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

const TABS = [
  { value: 'sales', label: 'Sales' },
  { value: 'withdrawals', label: 'Withdrawals' },
] as const;

export function IncomeTabs({ active }: { active: 'sales' | 'withdrawals' }) {
  const { navigate, pending } = useFilterNav();
  const [clicked, setClicked] = useState<string | null>(null);

  function go(value: string) {
    if (value === active) return;
    setClicked(value);
    navigate(`/income?tab=${value}`);
  }

  return (
    <div className="flex bg-secondary rounded-lg p-1 gap-1 w-fit" aria-busy={pending}>
      {TABS.map((t) => {
        const isActive = active === t.value;
        const isPending = pending && clicked === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => go(t.value)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md transition-all active:opacity-80',
              isActive ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {isPending && <Loader2 size={12} className="animate-spin" />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
