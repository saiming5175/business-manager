CREATE TYPE "public"."attachment_tag" AS ENUM('proof_of_payment', 'receipt');--> statement-breakpoint
CREATE TYPE "public"."attachment_type" AS ENUM('image', 'pdf');--> statement-breakpoint
CREATE TYPE "public"."payment_account" AS ENUM('personal', 'business');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('shopee', 'lazada', 'others');--> statement-breakpoint
CREATE TYPE "public"."withdrawal_type" AS ENUM('auto', 'manual');--> statement-breakpoint
CREATE TABLE "expense_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expense_id" uuid NOT NULL,
	"file_path" text NOT NULL,
	"file_type" "attachment_type" NOT NULL,
	"original_filename" text NOT NULL,
	"tag" "attachment_tag" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" text NOT NULL,
	"order_date" date NOT NULL,
	"item_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"payment_account" "payment_account" NOT NULL,
	"cost_rmb" numeric(12, 2),
	"cost_myr" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"period_date" date NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"platform" "platform" NOT NULL,
	"gross_amount_myr" numeric(12, 2) NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sales_user_year_month_platform" UNIQUE("user_id","year","month","platform")
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"withdrawal_date" date NOT NULL,
	"platform" "platform" NOT NULL,
	"amount_myr" numeric(12, 2) NOT NULL,
	"type" "withdrawal_type" NOT NULL,
	"order_id" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expense_attachments" ADD CONSTRAINT "expense_attachments_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;