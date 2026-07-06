'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUserId } from '@/data/auth';
import { addAttachment, deleteAttachment } from '@/data/attachments';

export async function uploadAttachmentAction(expenseId: string, formData: FormData) {
  const userId = await requireUserId();
  const file = formData.get('file') as File;
  const tag = z.enum(['proof_of_payment', 'receipt']).parse(formData.get('tag'));
  if (!file || file.size === 0) return;
  await addAttachment({ userId, expenseId, file, tag });
  revalidatePath(`/expenses/${expenseId}`);
  revalidatePath('/expenses');
}

export async function deleteAttachmentAction(expenseId: string, id: string) {
  const userId = await requireUserId();
  await deleteAttachment(userId, id);
  revalidatePath(`/expenses/${expenseId}`);
  revalidatePath('/expenses');
}
