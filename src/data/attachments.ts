import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { expenseAttachments } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { getExpense } from '@/data/expenses';

export interface AttachmentView {
  id: string;
  tag: 'proof_of_payment' | 'receipt';
  fileType: 'image' | 'pdf';
  originalFilename: string;
  signedUrl: string;
}

export async function listAttachments(userId: string, expenseId: string): Promise<AttachmentView[]> {
  const rows = await db.query.expenseAttachments.findMany({
    where: and(eq(expenseAttachments.userId, userId), eq(expenseAttachments.expenseId, expenseId)),
  });
  const supabase = await createClient();
  const views: AttachmentView[] = [];
  for (const r of rows) {
    const { data } = await supabase.storage.from('receipts').createSignedUrl(r.filePath, 600);
    views.push({
      id: r.id,
      tag: r.tag,
      fileType: r.fileType,
      originalFilename: r.originalFilename,
      signedUrl: data?.signedUrl ?? '#',
    });
  }
  return views;
}

// The file itself is uploaded directly from the browser to Supabase Storage
// (see AttachmentUpload) to avoid Next.js/Vercel server-action body-size limits.
// This records only the metadata row for a file already in storage.
export async function recordAttachment(params: {
  userId: string;
  expenseId: string;
  filePath: string;
  fileType: 'image' | 'pdf';
  originalFilename: string;
  tag: 'proof_of_payment' | 'receipt';
}): Promise<void> {
  const { userId, expenseId, filePath, fileType, originalFilename, tag } = params;

  const expense = await getExpense(userId, expenseId);
  if (!expense) throw new Error('Expense not found');

  // Security: only allow recording objects under this user's + expense's own folder,
  // so a caller can't attach an arbitrary storage path they don't own.
  if (!filePath.startsWith(`${userId}/${expenseId}/`)) {
    throw new Error('Invalid file path');
  }

  await db.insert(expenseAttachments).values({
    userId, expenseId, filePath, fileType, originalFilename, tag,
  });
}

export async function deleteAttachment(userId: string, id: string): Promise<void> {
  const row = await db.query.expenseAttachments.findFirst({
    where: and(eq(expenseAttachments.id, id), eq(expenseAttachments.userId, userId)),
  });
  if (!row) return;
  const supabase = await createClient();
  await supabase.storage.from('receipts').remove([row.filePath]);
  await db.delete(expenseAttachments).where(eq(expenseAttachments.id, id));
}
