-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('QUEUE_PRO', 'SELF_SERVICE_PRO');

-- AlterTable
ALTER TABLE "restaurants" 
ADD COLUMN IF NOT EXISTS "is_subscription_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "subscription_ends_at" TIMESTAMPTZ(3),
ADD COLUMN IF NOT EXISTS "subscription_plan_code" "SubscriptionPlan";
