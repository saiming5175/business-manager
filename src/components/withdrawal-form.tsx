const today = () => new Date().toLocaleDateString('en-CA');

export function WithdrawalForm({ action }: { action: (formData: FormData) => void }) {
  return (
    <form action={action} className="card flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col">
          <span className="field-label">Date</span>
          <input name="withdrawalDate" type="date" required defaultValue={today()} />
        </label>
        <label className="flex flex-col">
          <span className="field-label">Platform</span>
          <select name="platform">
            <option value="shopee">Shopee</option>
            <option value="lazada">Lazada</option>
            <option value="others">Others</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col">
          <span className="field-label">Amount (MYR)</span>
          <input name="amountMyr" type="number" step="0.01" min="0" required placeholder="0.00" />
        </label>
        <label className="flex flex-col">
          <span className="field-label">Type</span>
          <select name="type">
            <option value="auto">Auto withdrawal</option>
            <option value="manual">Manual withdrawal</option>
          </select>
        </label>
      </div>
      <label className="flex flex-col">
        <span className="field-label">Order ID (required for Others)</span>
        <input name="orderId" placeholder="Order ID" />
      </label>
      <label className="flex flex-col">
        <span className="field-label">Note (optional)</span>
        <input name="note" placeholder="Add a note" />
      </label>
      <button className="btn-primary justify-center">Add withdrawal</button>
    </form>
  );
}
