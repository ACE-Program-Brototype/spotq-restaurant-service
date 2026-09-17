-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "is_subscription_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscription_ends_at" TIMESTAMPTZ(3),
ADD COLUMN     "subscription_plan_code" TEXT;
