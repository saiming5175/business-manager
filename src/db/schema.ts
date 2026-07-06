import {
  pgTable, pgEnum, uuid, text, date, integer, numeric, timestamp, unique,
} from 'drizzle-orm/pg-core';

export const paymentAccountEnum = pgEnum('payment_account', ['personal', 'business']);
export const attachmentTypeEnum = pgEnum('attachment_type', ['image', 'pdf']);
export const attachmentTagEnum = pgEnum('attachment_tag', ['proof_of_payment', 'receipt']);
export const platformEnum = pgEnum('platform', ['shopee', 'lazada', 'others']);
export const withdrawalTypeEnum = pgEnum('withdrawal_type', ['auto', 'manual']);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  orderId: text('order_id').notNull(),
  orderDate: date('order_date').notNull(),
  itemName: text('item_name').notNull(),
  quantity: integer('quantity').notNull(),
  paymentAccount: paymentAccountEnum('payment_account').notNull(),
  costRmb: numeric('cost_rmb', { precision: 12, scale: 2 }),
  costMyr: numeric('cost_myr', { precision: 12, scale: 2 }).notNull(),
  ...timestamps,
});

export const expenseAttachments = pgTable('expense_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  expenseId: uuid('expense_id').notNull().references(() => expenses.id, { onDelete: 'cascade' }),
  filePath: text('file_path').notNull(),
  fileType: attachmentTypeEnum('file_type').notNull(),
  originalFilename: text('original_filename').notNull(),
  tag: attachmentTagEnum('tag').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sales = pgTable('sales', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  periodDate: date('period_date').notNull(),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  platform: platformEnum('platform').notNull(),
  grossAmountMyr: numeric('gross_amount_myr', { precision: 12, scale: 2 }).notNull(),
  note: text('note'),
  ...timestamps,
}, (t) => ({
  uniqPeriodPlatform: unique('sales_user_year_month_platform').on(t.userId, t.year, t.month, t.platform),
}));

export const withdrawals = pgTable('withdrawals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  withdrawalDate: date('withdrawal_date').notNull(),
  platform: platformEnum('platform').notNull(),
  amountMyr: numeric('amount_myr', { precision: 12, scale: 2 }).notNull(),
  type: withdrawalTypeEnum('type').notNull(),
  orderId: text('order_id'),
  note: text('note'),
  ...timestamps,
});
