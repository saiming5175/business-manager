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

  return (
    <div className="flex flex-wrap gap-2">
      <select value={kind} onChange={(e) => update({ kind: e.target.value })}
        className="rounded border p-2">
        <option value="month">Month</option>
        <option value="year">Year</option>
        <option value="all">All time</option>
      </select>
      {kind !== 'all' && (
        <input type="number" value={year} onChange={(e) => update({ year: e.target.value })}
          className="w-24 rounded border p-2" />
      )}
      {kind === 'month' && (
        <select value={month} onChange={(e) => update({ month: e.target.value })}
          className="rounded border p-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      )}
    </div>
  );
}
