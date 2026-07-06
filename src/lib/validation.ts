import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date');

// '' -> null, else coerced positive number
const optionalMoney = z
  .union([z.literal(''), z.coerce.number().positive()])
  .transform((v) => (v === '' ? null : v));

export const expenseSchema = z.object({
  orderId: z.string().trim().min(1, 'Order ID is required'),
  orderDate: isoDate,
  itemName: z.string().trim().min(1, 'Item name is required'),
  quantity: z.coerce.number().int().positive('Quantity must be > 0'),
  paymentAccount: z.enum(['personal', 'business']),
  costRmb: optionalMoney,
  costMyr: z.coerce.number().positive('Cost MYR is required'),
});
export type ExpenseInput = z.infer<typeof expenseSchema>;

export const salesSchema = z.object({
  periodDate: isoDate,
  platform: z.enum(['shopee', 'lazada', 'others']),
  grossAmountMyr: z.coerce.number().nonnegative(),
  note: z.string().trim().optional().nullable(),
});
export type SalesInput = z.infer<typeof salesSchema>;

export const withdrawalSchema = z
  .object({
    withdrawalDate: isoDate,
    platform: z.enum(['shopee', 'lazada', 'others']),
    amountMyr: z.coerce.number().positive(),
    type: z.enum(['auto', 'manual']),
    orderId: z.string().trim().optional().nullable(),
    note: z.string().trim().optional().nullable(),
  })
  .refine((d) => d.platform !== 'others' || !!d.orderId, {
    message: 'Order ID is required for the Others platform',
    path: ['orderId'],
  });
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
