import Link from 'next/link';
import { requireUserId } from '@/data/auth';
import { listExpenses } from '@/data/expenses';
import { formatMYR } from '@/lib/money';
import { periodFromParams, dateInPeriod } from '@/lib/period';
import { PeriodSelector } from '@/components/period-selector';
import { SearchBox } from '@/components/search-box';

const tagLabel = { proof_of_payment: 'Proof', receipt: 'Receipt' } as const;
const tagBadgeClass = { proof_of_payment: 'badge-proof', receipt: 'badge-receipt' } as const;

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; year?: string; month?: string; q?: string }>;
}) {
  const userId = await requireUserId();
  const params = await searchParams;
  const period = params.kind ? periodFromParams(params) : { kind: 'all' as const };
  const q = params.q?.trim().toLowerCase() ?? '';
  const items = (await listExpenses(userId)).filter((e) => {
    if (!dateInPeriod(e.orderDate, period)) return false;
    if (!q) return true;
    return e.itemName.toLowerCase().includes(q) || e.orderId.toLowerCase().includes(q);
  });
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-[-0.025em]">Expenses</h1>
        <Link href="/expenses/new" className="btn-primary">
          <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add expense
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        <PeriodSelector />
        <SearchBox />
      </div>
      <ul className="card flex flex-col divide-y divide-hair p-0">
        {items.map((e) => (
          <li key={e.id}>
            <Link href={`/expenses/${e.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-canvas">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
                  <span className="truncate">{e.itemName}</span>
                  {e.tags.length === 0 && <span className="badge badge-none">No files</span>}
                  {e.tags.map((t) => (
                    <span key={t} className={`badge ${tagBadgeClass[t]}`}>{tagLabel[t]}</span>
                  ))}
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  {e.orderDate} · #{e.orderId} · ×{e.quantity} · {e.paymentAccount}
                </div>
              </div>
              <span className="tnum shrink-0 text-[14.5px] font-semibold">{formatMYR(e.costMyr)}</span>
            </Link>
          </li>
        ))}
        {items.length === 0 && (
          <li className="px-5 py-6 text-sm text-muted">No matching expenses.</li>
        )}
      </ul>
    </div>
  );
}
