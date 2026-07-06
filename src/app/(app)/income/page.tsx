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
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Income</h1>
      <div className="flex gap-2 border-b">
        <Link href="/income?tab=sales" className={active === 'sales' ? 'border-b-2 border-black py-2 font-medium' : 'py-2 text-gray-500'}>Sales</Link>
        <Link href="/income?tab=withdrawals" className={active === 'withdrawals' ? 'border-b-2 border-black py-2 font-medium' : 'py-2 text-gray-500'}>Withdrawals</Link>
      </div>
      {active === 'sales' ? <SalesTab userId={userId} /> : <WithdrawalsTab userId={userId} />}
    </div>
  );
}

async function SalesTab({ userId }: { userId: string }) {
  const items = await listSales(userId);
  return (
    <div className="flex flex-col gap-3">
      <SalesForm action={saveSalesAction} />
      <ul className="flex flex-col gap-2">
        {items.map((s) => {
          const remove = delSales.bind(null, s.id);
          return (
            <li key={s.id} className="flex items-center justify-between rounded border p-3">
              <span>{s.year}-{String(s.month).padStart(2, '0')} · {platformLabel[s.platform]}</span>
              <span className="flex items-center gap-3">
                {formatMYR(s.grossAmountMyr)}
                <form action={remove}><button className="text-xs text-red-600">Delete</button></form>
              </span>
            </li>
          );
        })}
        {items.length === 0 && <li className="text-sm text-gray-500">No sales recorded.</li>}
      </ul>
    </div>
  );
}

async function WithdrawalsTab({ userId }: { userId: string }) {
  const items = await listWithdrawals(userId);
  return (
    <div className="flex flex-col gap-3">
      <WithdrawalForm action={saveWithdrawalAction} />
      <ul className="flex flex-col gap-2">
        {items.map((w) => {
          const remove = delWithdrawal.bind(null, w.id);
          return (
            <li key={w.id} className="flex items-center justify-between rounded border p-3">
              <span>{w.withdrawalDate} · {platformLabel[w.platform]} · {w.type}{w.orderId ? ` · ${w.orderId}` : ''}</span>
              <span className="flex items-center gap-3">
                {formatMYR(w.amountMyr)}
                <form action={remove}><button className="text-xs text-red-600">Delete</button></form>
              </span>
            </li>
          );
        })}
        {items.length === 0 && <li className="text-sm text-gray-500">No withdrawals recorded.</li>}
      </ul>
    </div>
  );
}
