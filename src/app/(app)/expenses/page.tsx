import Link from 'next/link';
import { AlertCircle, Plus } from 'lucide-react';
import { requireUserId } from '@/data/auth';
import { listExpenses } from '@/data/expenses';
import { formatMYR } from '@/lib/money';
import { periodFromParams, dateInPeriod } from '@/lib/period';
import { PeriodSelector } from '@/components/period-selector';
import { SearchBox } from '@/components/search-box';

const tagLabel = { proof_of_payment: 'Proof', receipt: 'Receipt' } as const;
const tagBadgeClass = {
  proof_of_payment: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  receipt: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
} as const;

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
  const total = items.reduce((sum, e) => sum + e.costMyr, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} records · {formatMYR(total)} total</p>
        </div>
        <Link
          href="/expenses/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          <span>Add Entry</span>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <PeriodSelector />
        <SearchBox />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle size={32} className="text-muted-foreground mb-3" />
            <p className="text-foreground font-medium">No expenses found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or add a new entry.</p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {items.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/expenses/${e.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-foreground">
                      <span className="truncate">{e.itemName}</span>
                      {e.tags.length === 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border bg-secondary text-muted-foreground border-border">
                          No files
                        </span>
                      )}
                      {e.tags.map((t) => (
                        <span
                          key={t}
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${tagBadgeClass[t]}`}
                        >
                          {tagLabel[t]}
                        </span>
                      ))}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {e.orderDate} · #{e.orderId} · ×{e.quantity} ·{' '}
                      <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">{e.paymentAccount}</span>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-medium text-foreground">{formatMYR(e.costMyr)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
