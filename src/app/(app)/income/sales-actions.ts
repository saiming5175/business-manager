'use server';

import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/data/auth';
import { salesSchema } from '@/lib/validation';
import { upsertSales, deleteSales } from '@/data/sales';

export async function saveSalesAction(formData: FormData) {
  const userId = await requireUserId();
  const result = salesSchema.safeParse({
    periodDate: formData.get('periodDate'),
    platform: formData.get('platform'),
    grossAmountMyr: formData.get('grossAmountMyr'),
    note: formData.get('note') ?? '',
  });
  if (!result.success) {
    const first = result.error.issues[0];
    throw new Error(first?.message ?? 'Invalid input');
  }
  await upsertSales(userId, result.data);
  revalidatePath('/income');
}

export async function deleteSalesAction(id: string) {
  const userId = await requireUserId();
  await deleteSales(userId, id);
  revalidatePath('/income');
}
