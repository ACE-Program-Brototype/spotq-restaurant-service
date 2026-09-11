-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "is_subscription_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "subscription_plan_code" TEXT,
ADD COLUMN IF NOT EXISTS "subscription_ends_at" TIMESTAMPTZ(3);
