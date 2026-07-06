import Link from 'next/link';
import { requireUserId } from '@/data/auth';
import { listExpenses } from '@/data/expenses';
import { formatMYR } from '@/lib/money';

const tagLabel = { proof_of_payment: 'Proof', receipt: 'Receipt' } as const;

export default async function ExpensesPage() {
  const userId = await requireUserId();
  const items = await listExpenses(userId);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Expenses</h1>
        <Link href="/expenses/new" className="rounded bg-black px-3 py-2 text-sm text-white">+ Add</Link>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((e) => (
          <li key={e.id}>
            <Link href={`/expenses/${e.id}`} className="block rounded border p-3">
              <div className="flex justify-between">
                <span className="font-medium">{e.itemName}</span>
                <span>{formatMYR(e.costMyr)}</span>
              </div>
              <div className="text-sm text-gray-500">{e.orderDate} · {e.orderId} · x{e.quantity} · {e.paymentAccount}</div>
              <div className="mt-1 flex gap-1">
                {e.tags.length === 0 && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">No files</span>}
                {e.tags.map((t) => (
                  <span key={t} className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">{tagLabel[t]}</span>
                ))}
              </div>
            </Link>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-gray-500">No expenses yet.</li>}
      </ul>
    </div>
  );
}
