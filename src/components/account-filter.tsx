'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useFilterNav } from './use-filter-nav';

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

const OPTIONS = [
  { value: '', label: 'All accounts' },
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
] as const;

export function AccountFilter() {
  const params = useSearchParams();
  const account = params.get('account') ?? '';
  const { navigate, pending } = useFilterNav();
  const [clicked, setClicked] = useState<string | null>(null);

  function update(value: string) {
    setClicked(value);
    const sp = new URLSearchParams(params.toString());
    if (value) {
      sp.set('account', value);
    } else {
      sp.delete('account');
    }
    navigate(`?${sp.toString()}`);
  }

  return (
    <div className="flex bg-secondary rounded-lg p-1 gap-1 w-fit" aria-busy={pending}>
      {OPTIONS.map((o) => {
        const isActive = account === o.value;
        const isPending = pending && clicked === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => update(o.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap active:opacity-80',
              isActive ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {isPending && <Loader2 size={12} className="animate-spin" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
