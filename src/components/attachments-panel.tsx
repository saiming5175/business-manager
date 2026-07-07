import { listAttachments } from '@/data/attachments';
import { uploadAttachmentAction, deleteAttachmentAction } from '@/app/(app)/expenses/attachment-actions';

const tagLabel = { proof_of_payment: 'Proof of Payment', receipt: 'Receipt' } as const;
const tagBadgeClass = { proof_of_payment: 'badge-proof', receipt: 'badge-receipt' } as const;

export async function AttachmentsPanel({ userId, expenseId }: { userId: string; expenseId: string }) {
  const files = await listAttachments(userId, expenseId);
  const upload = uploadAttachmentAction.bind(null, expenseId);

  return (
    <section className="card flex flex-col gap-4">
      <h2 className="text-[15px] font-semibold">Receipts & proofs</h2>
      <ul className="flex flex-col divide-y divide-hair">
        {files.map((f) => {
          const remove = deleteAttachmentAction.bind(null, expenseId, f.id);
          return (
            <li key={f.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
              <a href={f.signedUrl} target="_blank" rel="noreferrer" className="truncate text-sm font-medium text-accent-ink underline underline-offset-2">
                {f.originalFilename}
              </a>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`badge ${tagBadgeClass[f.tag]}`}>{tagLabel[f.tag]}</span>
                <form action={remove}>
                  <button className="text-xs font-medium text-down hover:underline">Remove</button>
                </form>
              </div>
            </li>
          );
        })}
        {files.length === 0 && <li className="py-2 text-sm text-muted">No files uploaded.</li>}
      </ul>
      <form action={upload} className="flex flex-col gap-3 border-t border-hair pt-4 sm:flex-row sm:items-center">
        <input name="file" type="file" accept="image/*,application/pdf" required className="text-sm sm:flex-1" />
        <select name="tag" className="sm:w-48">
          <option value="receipt">Receipt</option>
          <option value="proof_of_payment">Proof of Payment</option>
        </select>
        <button className="btn-primary justify-center">Upload</button>
      </form>
    </section>
  );
}
