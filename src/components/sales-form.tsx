const today = () => new Date().toLocaleDateString('en-CA');

export function SalesForm({ action }: { action: (formData: FormData) => void }) {
  return (
    <form action={action} className="flex flex-col gap-2 rounded border p-3">
      <input name="periodDate" type="date" required defaultValue={today()} className="rounded border p-2" />
      <select name="platform" className="rounded border p-2">
        <option value="shopee">Shopee</option>
        <option value="lazada">Lazada</option>
        <option value="others">Others</option>
      </select>
      <input name="grossAmountMyr" type="number" step="0.01" min="0" required placeholder="Gross sales (MYR)" className="rounded border p-2" />
      <input name="note" placeholder="Note (optional)" className="rounded border p-2" />
      <button className="rounded bg-black p-2 text-sm text-white">Save monthly sales</button>
    </form>
  );
}
