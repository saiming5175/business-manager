import Link from 'next/link';
import { requireUserId } from '@/data/auth';
import { listSales } from '@/data/sales';
import { listWithdrawals } from '@/data/withdrawals';
import { saveSalesAction, deleteSalesAction as delSales } from './sales-actions';
import { saveWithdrawalAction, deleteWithdrawalAction as delWithdrawal } from './withdrawals-actions';
import { SalesForm } from '@/components/sales-form';
import { WithdrawalForm } from '@/components/withdrawal-form';
import { PlatformBadge } from '@/components/ui-kit';
import { ConfirmDelete } from '@/components/confirm-delete';
import { formatMYR } from '@/lib/money';

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export default async function IncomePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const active = tab === 'withdrawals' ? 'withdrawals' : 'sales';
  const userId = await requireUserId();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Income</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Record sales and platform withdrawals</p>
      </div>

      <div className="flex bg-secondary rounded-lg p-1 gap-1 w-fit">
        <Link
          href="/income?tab=sales"
          className={cn(
            'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
            active === 'sales' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Sales
        </Link>
        <Link
          href="/income?tab=withdrawals"
          className={cn(
            'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
            active === 'withdrawals' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Withdrawals
        </Link>
      </div>

      {active === 'sales' ? <SalesTab userId={userId} /> : <WithdrawalsTab userId={userId} />}
    </div>
  );
}

async function SalesTab({ userId }: { userId: string }) {
  const items = await listSales(userId);
  const total = items.reduce((sum, s) => sum + s.grossAmountMyr, 0);
  return (
    <div className="grid lg:grid-cols-5 gap-5">
      <div className="lg:col-span-2">
        <SalesForm action={saveSalesAction} />
      </div>
      <div className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Sales Records</h2>
          <span className="text-xs font-mono text-emerald-400">{formatMYR(total)} total</span>
        </div>
        {items.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">No sales recorded.</div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((s) => {
              const remove = delSales.bind(null, s.id);
              const note = `${s.year}-${String(s.month).padStart(2, '0')}`;
              return (
                <div key={s.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-3">
                    <PlatformBadge platform={s.platform} />
                    <div>
                      <p className="text-sm font-medium text-foreground font-mono">{formatMYR(s.grossAmountMyr)}</p>
                      <p className="text-xs text-muted-foreground">{note}</p>
                    </div>
                  </div>
                  <ConfirmDelete action={remove} iconOnly label="Delete sale" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

async function WithdrawalsTab({ userId }: { userId: string }) {
  const items = await listWithdrawals(userId);
  const total = items.reduce((sum, w) => sum + w.amountMyr, 0);
  return (
    <div className="grid lg:grid-cols-5 gap-5">
      <div className="lg:col-span-2">
        <WithdrawalForm action={saveWithdrawalAction} />
      </div>
      <div className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Withdrawal Records</h2>
          <span className="text-xs font-mono text-emerald-400">{formatMYR(total)} total</span>
        </div>
        {items.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">No withdrawals recorded.</div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((w) => {
              const remove = delWithdrawal.bind(null, w.id);
              const note = `${w.withdrawalDate} · ${w.type}${w.orderId ? ` · ${w.orderId}` : ''}`;
              return (
                <div key={w.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-3">
                    <PlatformBadge platform={w.platform} />
                    <div>
                      <p className="text-sm font-medium text-foreground font-mono">{formatMYR(w.amountMyr)}</p>
                      <p className="text-xs text-muted-foreground">{note}</p>
                    </div>
                  </div>
                  <ConfirmDelete action={remove} iconOnly label="Delete withdrawal" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
