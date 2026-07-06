'use server';

import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/data/auth';
import { withdrawalSchema } from '@/lib/validation';
import { createWithdrawal, deleteWithdrawal } from '@/data/withdrawals';

export async function saveWithdrawalAction(formData: FormData) {
  const userId = await requireUserId();
  const input = withdrawalSchema.parse({
    withdrawalDate: formData.get('withdrawalDate'),
    platform: formData.get('platform'),
    amountMyr: formData.get('amountMyr'),
    type: formData.get('type'),
    orderId: formData.get('orderId') ?? '',
    note: formData.get('note') ?? '',
  });
  await createWithdrawal(userId, input);
  revalidatePath('/income');
}

export async function deleteWithdrawalAction(id: string) {
  const userId = await requireUserId();
  await deleteWithdrawal(userId, id);
  revalidatePath('/income');
}
