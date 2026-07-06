'use server';

import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/data/auth';
import { salesSchema } from '@/lib/validation';
import { upsertSales, deleteSales } from '@/data/sales';

export async function saveSalesAction(formData: FormData) {
  const userId = await requireUserId();
  const input = salesSchema.parse({
    periodDate: formData.get('periodDate'),
    platform: formData.get('platform'),
    grossAmountMyr: formData.get('grossAmountMyr'),
    note: formData.get('note') ?? '',
  });
  await upsertSales(userId, input);
  revalidatePath('/income');
}

export async function deleteSalesAction(id: string) {
  const userId = await requireUserId();
  await deleteSales(userId, id);
  revalidatePath('/income');
}
