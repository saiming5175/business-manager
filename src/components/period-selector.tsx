'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function PeriodSelector() {
  const router = useRouter();
  const params = useSearchParams();
  const kind = params.get('kind') ?? 'month';
  const now = new Date();
  const year = Number(params.get('year') ?? now.getFullYear());
  const month = Number(params.get('month') ?? now.getMonth() + 1);

  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => sp.set(k, v));
    router.push(`?${sp.toString()}`);
  }

  const kinds = [
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All time' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="seg">
        {kinds.map((k) => (
          <button
            key={k.value}
            type="button"
            className={kind === k.value ? 'on' : ''}
            onClick={() => update({ kind: k.value })}
          >
            {k.label}
          </button>
        ))}
      </div>
      {kind !== 'all' && (
        <input
          type="number"
          value={year}
          onChange={(e) => update({ year: e.target.value })}
          className="w-24 !min-h-0 rounded-[9px] border border-hair-2 bg-paper px-3 py-2 text-[13px] font-medium"
        />
      )}
      {kind === 'month' && (
        <select
          value={month}
          onChange={(e) => update({ month: e.target.value })}
          className="!min-h-0 rounded-[9px] border border-hair-2 bg-paper px-3 py-2 text-[13px] font-medium"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      )}
    </div>
  );
}
