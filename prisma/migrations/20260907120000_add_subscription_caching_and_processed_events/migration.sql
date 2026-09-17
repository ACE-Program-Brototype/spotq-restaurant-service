-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "is_subscription_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "subscription_ends_at" TIMESTAMPTZ(3),
ADD COLUMN IF NOT EXISTS "subscription_plan_code" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "processed_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "processed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_events_pkey" PRIMARY KEY ("id")
);
