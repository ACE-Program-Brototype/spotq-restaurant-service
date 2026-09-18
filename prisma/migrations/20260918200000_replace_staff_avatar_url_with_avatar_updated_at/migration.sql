-- AlterTable
ALTER TABLE "restaurant_staff" DROP COLUMN IF EXISTS "avatar_url",
ADD COLUMN "avatar_updated_at" TIMESTAMPTZ(3);
