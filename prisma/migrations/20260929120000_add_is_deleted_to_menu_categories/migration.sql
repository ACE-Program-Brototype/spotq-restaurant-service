-- AlterTable
ALTER TABLE "menu_categories" ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- DropIndex
DROP INDEX IF EXISTS "menu_categories_restaurant_id_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "menu_categories_restaurant_id_name_key" ON "menu_categories"("restaurant_id", "name") WHERE "is_deleted" = false;
