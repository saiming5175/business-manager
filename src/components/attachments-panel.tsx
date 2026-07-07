import { ChevronDown } from 'lucide-react';
import { listAttachments } from '@/data/attachments';
import { uploadAttachmentAction, deleteAttachmentAction } from '@/app/(app)/expenses/attachment-actions';
import { ConfirmDelete } from '@/components/confirm-delete';

const tagLabel = { proof_of_payment: 'Proof of Payment', receipt: 'Receipt' } as const;
const tagBadgeClass = {
  proof_of_payment: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  receipt: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
} as const;

export async function AttachmentsPanel({ userId, expenseId }: { userId: string; expenseId: string }) {
  const files = await listAttachments(userId, expenseId);
  const upload = uploadAttachmentAction.bind(null, expenseId);

  return (
    <section className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 max-w-lg">
      <h2 className="text-sm font-semibold text-foreground">Receipts & proofs</h2>
      <ul className="flex flex-col divide-y divide-border">
        {files.map((f) => {
          const remove = deleteAttachmentAction.bind(null, expenseId, f.id);
          return (
            <li key={f.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
              <a
                href={f.signedUrl}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm font-medium text-primary underline underline-offset-2 hover:text-primary/80"
              >
                {f.originalFilename}
              </a>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${tagBadgeClass[f.tag]}`}>
                  {tagLabel[f.tag]}
                </span>
                <ConfirmDelete action={remove} label="Remove" />
              </div>
            </li>
          );
        })}
        {files.length === 0 && <li className="py-2 text-sm text-muted-foreground">No files uploaded.</li>}
      </ul>
      <form action={upload} className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
        <input name="file" type="file" accept="image/*,application/pdf" required className="text-sm sm:flex-1" />
        <div className="relative sm:w-48">
          <select name="tag" className="w-full appearance-none pr-8 cursor-pointer">
            <option value="receipt">Receipt</option>
            <option value="proof_of_payment">Proof of Payment</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        <button className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center">
          Upload
        </button>
      </form>
    </section>
  );
}
