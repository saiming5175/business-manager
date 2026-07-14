import { ChevronDown, Plus } from 'lucide-react';
import { SubmitButton } from '@/components/submit-button';

const today = () => new Date().toLocaleDateString('en-CA');

export function SalesForm({ action }: { action: (formData: FormData) => void }) {
  return (
    <form action={action} className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Record Monthly Sales</h2>
      <div className="space-y-3">
        <label className="flex flex-col">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Date</span>
          <input name="periodDate" type="date" required defaultValue={today()} />
        </label>
        <label className="flex flex-col">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Platform</span>
          <div className="relative">
            <select name="platform" className="w-full appearance-none pr-8 cursor-pointer">
              <option value="shopee">Shopee</option>
              <option value="lazada">Lazada</option>
              <option value="others">Others</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </label>
        <label className="flex flex-col">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">
            Gross Sales (MYR) <span className="text-red-400">*</span>
          </span>
          <input name="grossAmountMyr" type="number" step="0.01" min="0" required placeholder="0.00" />
        </label>
        <label className="flex flex-col">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Note (optional)</span>
          <input name="note" placeholder="e.g. June payout" />
        </label>
        <SubmitButton
          icon={<Plus size={14} />}
          className="w-full bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          Save Sales Record
        </SubmitButton>
      </div>
    </form>
  );
}
