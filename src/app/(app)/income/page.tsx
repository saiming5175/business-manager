import Link from 'next/link';
import { requireUserId } from '@/data/auth';
import { listSales } from '@/data/sales';
import { listWithdrawals } from '@/data/withdrawals';
import { saveSalesAction, deleteSalesAction as delSales } from './sales-actions';
import { saveWithdrawalAction, deleteWithdrawalAction as delWithdrawal } from './withdrawals-actions';
import { SalesForm } from '@/components/sales-form';
import { WithdrawalForm } from '@/components/withdrawal-form';
import { formatMYR } from '@/lib/money';

const platformLabel = { shopee: 'Shopee', lazada: 'Lazada', others: 'Others' } as const;

export default async function IncomePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const active = tab === 'withdrawals' ? 'withdrawals' : 'sales';
  const userId = await requireUserId();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-[-0.025em]">Income</h1>
      <div className="flex gap-1 border-b border-hair">
        <Link
          href="/income?tab=sales"
          className={
            active === 'sales'
              ? 'border-b-2 border-ink px-1 py-2.5 text-sm font-semibold text-ink'
              : 'border-b-2 border-transparent px-1 py-2.5 text-sm font-medium text-muted'
          }
        >
          Sales
        </Link>
        <Link
          href="/income?tab=withdrawals"
          className={
            active === 'withdrawals'
              ? 'ml-4 border-b-2 border-ink px-1 py-2.5 text-sm font-semibold text-ink'
              : 'ml-4 border-b-2 border-transparent px-1 py-2.5 text-sm font-medium text-muted'
          }
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
  return (
    <div className="flex flex-col gap-4">
      <SalesForm action={saveSalesAction} />
      <ul className="card flex flex-col divide-y divide-hair p-0">
        {items.map((s) => {
          const remove = delSales.bind(null, s.id);
          return (
            <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <span className="text-sm font-medium">
                {s.year}-{String(s.month).padStart(2, '0')} · {platformLabel[s.platform]}
              </span>
              <span className="flex items-center gap-4">
                <span className="tnum text-sm font-semibold">{formatMYR(s.grossAmountMyr)}</span>
                <form action={remove}>
                  <button className="text-xs font-medium text-down hover:underline">Delete</button>
                </form>
              </span>
            </li>
          );
        })}
        {items.length === 0 && <li className="px-5 py-6 text-sm text-muted">No sales recorded.</li>}
      </ul>
    </div>
  );
}

async function WithdrawalsTab({ userId }: { userId: string }) {
  const items = await listWithdrawals(userId);
  return (
    <div className="flex flex-col gap-4">
      <WithdrawalForm action={saveWithdrawalAction} />
      <ul className="card flex flex-col divide-y divide-hair p-0">
        {items.map((w) => {
          const remove = delWithdrawal.bind(null, w.id);
          return (
            <li key={w.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <span className="text-sm font-medium">
                {w.withdrawalDate} · {platformLabel[w.platform]} · {w.type}{w.orderId ? ` · ${w.orderId}` : ''}
              </span>
              <span className="flex items-center gap-4">
                <span className="tnum text-sm font-semibold">{formatMYR(w.amountMyr)}</span>
                <form action={remove}>
                  <button className="text-xs font-medium text-down hover:underline">Delete</button>
                </form>
              </span>
            </li>
          );
        })}
        {items.length === 0 && <li className="px-5 py-6 text-sm text-muted">No withdrawals recorded.</li>}
      </ul>
    </div>
  );
}
