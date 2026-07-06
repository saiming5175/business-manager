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

export async function addAttachment(params: {
  userId: string; expenseId: string; file: File; tag: 'proof_of_payment' | 'receipt';
}): Promise<void> {
  const { userId, expenseId, file, tag } = params;
  const expense = await getExpense(userId, expenseId);
  if (!expense) throw new Error('Expense not found');
  const fileType: 'image' | 'pdf' = file.type === 'application/pdf' ? 'pdf' : 'image';
  const path = `${userId}/${expenseId}/${crypto.randomUUID()}-${file.name}`;

  const supabase = await createClient();
  const { error } = await supabase.storage.from('receipts').upload(path, file, {
    contentType: file.type, upsert: false,
  });
  if (error) throw error;

  await db.insert(expenseAttachments).values({
    userId, expenseId, filePath: path, fileType, originalFilename: file.name, tag,
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
