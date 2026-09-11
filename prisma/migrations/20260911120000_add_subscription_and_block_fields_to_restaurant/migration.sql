-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN "is_subscription_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "subscription_plan_code" TEXT,
ADD COLUMN "subscription_ends_at" TIMESTAMPTZ(3),
ADD COLUMN "is_blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "block_reason" TEXT;
