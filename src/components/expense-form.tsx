import type { ExpenseListItem } from '@/data/expenses';

const today = () => new Date().toLocaleDateString('en-CA');

export function ExpenseForm({
  action, defaults, submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: Partial<ExpenseListItem>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="card flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col">
          <span className="field-label">Order ID *</span>
          <input name="orderId" required defaultValue={defaults?.orderId ?? ''} />
        </label>
        <label className="flex flex-col">
          <span className="field-label">Order date *</span>
          <input name="orderDate" type="date" required defaultValue={defaults?.orderDate ?? today()} />
        </label>
      </div>

      <label className="flex flex-col">
        <span className="field-label">Item name *</span>
        <input name="itemName" required defaultValue={defaults?.itemName ?? ''} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col">
          <span className="field-label">Quantity *</span>
          <input name="quantity" type="number" min="1" required defaultValue={defaults?.quantity ?? 1} />
        </label>
        <label className="flex flex-col">
          <span className="field-label">Payment account *</span>
          <select name="paymentAccount" defaultValue={defaults?.paymentAccount ?? 'business'}>
            <option value="business">Business</option>
            <option value="personal">Personal</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col">
          <span className="field-label">Cost RMB (optional)</span>
          <input name="costRmb" type="number" step="0.01" min="0" defaultValue={defaults?.costRmb ?? ''} />
        </label>
        <label className="flex flex-col">
          <span className="field-label">Cost MYR *</span>
          <input name="costMyr" type="number" step="0.01" min="0" required defaultValue={defaults?.costMyr ?? ''} />
        </label>
      </div>

      <button className="btn-primary justify-center">{submitLabel}</button>
    </form>
  );
}
