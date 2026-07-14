'use client';

import { Search, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useFilterNav } from './use-filter-nav';

export function SearchBox() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const { navigate, pending } = useFilterNav();

  function update(value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value) {
      sp.set('q', value);
    } else {
      sp.delete('q');
    }
    navigate(`?${sp.toString()}`);
  }

  return (
    <div className="relative flex-1 min-w-48">
      {pending ? (
        <Loader2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 animate-spin text-primary" />
      ) : (
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      )}
      <input
        type="text"
        defaultValue={q}
        onChange={(e) => update(e.target.value)}
        placeholder="Search item or order ID…"
        className="w-full bg-secondary border border-border text-foreground text-sm rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
      />
    </div>
  );
}
