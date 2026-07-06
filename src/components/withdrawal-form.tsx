const today = () => new Date().toISOString().slice(0, 10);

export function WithdrawalForm({ action }: { action: (formData: FormData) => void }) {
  return (
    <form action={action} className="flex flex-col gap-2 rounded border p-3">
      <input name="withdrawalDate" type="date" required defaultValue={today()} className="rounded border p-2" />
      <select name="platform" className="rounded border p-2">
        <option value="shopee">Shopee</option>
        <option value="lazada">Lazada</option>
        <option value="others">Others</option>
      </select>
      <input name="amountMyr" type="number" step="0.01" min="0" required placeholder="Amount (MYR)" className="rounded border p-2" />
      <select name="type" className="rounded border p-2">
        <option value="auto">Auto withdrawal</option>
        <option value="manual">Manual withdrawal</option>
      </select>
      <input name="orderId" placeholder="Order ID (required for Others)" className="rounded border p-2" />
      <input name="note" placeholder="Note (optional)" className="rounded border p-2" />
      <button className="rounded bg-black p-2 text-sm text-white">Add withdrawal</button>
    </form>
  );
}
