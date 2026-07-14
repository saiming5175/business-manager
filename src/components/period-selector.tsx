'use client';

import { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useFilterNav } from './use-filter-nav';

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-secondary border border-border text-foreground text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

export function PeriodSelector({
  defaultKind = 'month',
}: {
  defaultKind?: 'month' | 'year' | 'all';
} = {}) {
  const params = useSearchParams();
  const { navigate, pending } = useFilterNav();
  const [clickedKind, setClickedKind] = useState<string | null>(null);
  const kind = params.get('kind') ?? defaultKind;
  const now = new Date();
  const year = Number(params.get('year') ?? now.getFullYear());
  const month = Number(params.get('month') ?? now.getMonth() + 1);

  function update(next: Record<string, string>) {
    if (next.kind) setClickedKind(next.kind);
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => sp.set(k, v));
    navigate(`?${sp.toString()}`);
  }

  const kinds = [
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All time' },
  ];

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex bg-secondary rounded-lg p-1 gap-1 w-fit">
        {kinds.map((k) => {
          const isPending = pending && clickedKind === k.value;
          return (
            <button
              key={k.value}
              type="button"
              onClick={() => update({ kind: k.value })}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all active:opacity-80',
                kind === k.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isPending && <Loader2 size={12} className="animate-spin" />}
              {k.label}
            </button>
          );
        })}
      </div>
      {kind !== 'all' && (
        <input
          type="number"
          value={year}
          onChange={(e) => update({ year: e.target.value })}
          className="w-24 bg-secondary border border-border text-foreground text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      )}
      {kind === 'month' && (
        <Select value={String(month)} onChange={(v) => update({ month: v })} options={monthOptions} className="w-24" />
      )}
    </div>
  );
}
