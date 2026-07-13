'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUserId } from '@/data/auth';
import { recordAttachment, deleteAttachment } from '@/data/attachments';

const recordInput = z.object({
  filePath: z.string().min(1),
  fileType: z.enum(['image', 'pdf']),
  originalFilename: z.string().min(1),
  tag: z.enum(['proof_of_payment', 'receipt']),
});

// The browser uploads the file straight to Supabase Storage, then calls this to
// record the metadata row. Only a tiny JSON payload crosses the server action.
export async function recordAttachmentAction(expenseId: string, input: unknown) {
  const userId = await requireUserId();
  const data = recordInput.parse(input);
  await recordAttachment({ userId, expenseId, ...data });
  revalidatePath(`/expenses/${expenseId}`);
  revalidatePath('/expenses');
}

export async function deleteAttachmentAction(expenseId: string, id: string) {
  const userId = await requireUserId();
  await deleteAttachment(userId, id);
  revalidatePath(`/expenses/${expenseId}`);
  revalidatePath('/expenses');
}
