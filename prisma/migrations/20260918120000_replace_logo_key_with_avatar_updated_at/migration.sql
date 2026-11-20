-- AlterTable
ALTER TABLE "restaurant_profile" DROP COLUMN IF EXISTS "logo_key",
ADD COLUMN "avatar_updated_at" TIMESTAMPTZ(3);
