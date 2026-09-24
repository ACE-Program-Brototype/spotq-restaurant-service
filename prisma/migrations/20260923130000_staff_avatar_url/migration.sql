-- AlterTable staff: replace avatar_updated_at with avatar_url
ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;
ALTER TABLE "staff" DROP COLUMN IF EXISTS "avatar_updated_at";
