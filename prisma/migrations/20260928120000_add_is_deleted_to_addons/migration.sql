-- AlterTable
ALTER TABLE "addons" ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- DropIndex
DROP INDEX IF EXISTS "addons_restaurant_id_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "addons_restaurant_id_name_key" ON "addons"("restaurant_id", "name") WHERE "is_deleted" = false;
