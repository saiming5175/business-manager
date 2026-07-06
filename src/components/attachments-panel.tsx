import { listAttachments } from '@/data/attachments';
import { uploadAttachmentAction, deleteAttachmentAction } from '@/app/(app)/expenses/attachment-actions';

const tagLabel = { proof_of_payment: 'Proof of Payment', receipt: 'Receipt' } as const;

export async function AttachmentsPanel({ userId, expenseId }: { userId: string; expenseId: string }) {
  const files = await listAttachments(userId, expenseId);
  const upload = uploadAttachmentAction.bind(null, expenseId);

  return (
    <section className="flex flex-col gap-3 rounded border p-3">
      <h2 className="font-medium">Receipts & Proofs</h2>
      <ul className="flex flex-col gap-2">
        {files.map((f) => {
          const remove = deleteAttachmentAction.bind(null, expenseId, f.id);
          return (
            <li key={f.id} className="flex items-center justify-between gap-2">
              <a href={f.signedUrl} target="_blank" rel="noreferrer" className="truncate text-blue-600 underline">
                {f.originalFilename}
              </a>
              <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">{tagLabel[f.tag]}</span>
              <form action={remove}><button className="text-xs text-red-600">Remove</button></form>
            </li>
          );
        })}
        {files.length === 0 && <li className="text-sm text-gray-500">No files uploaded.</li>}
      </ul>
      <form action={upload} className="flex flex-col gap-2 border-t pt-3">
        <input name="file" type="file" accept="image/*,application/pdf" required className="text-sm" />
        <select name="tag" className="rounded border p-2">
          <option value="receipt">Receipt</option>
          <option value="proof_of_payment">Proof of Payment</option>
        </select>
        <button className="rounded bg-black p-2 text-sm text-white">Upload</button>
      </form>
    </section>
  );
}
