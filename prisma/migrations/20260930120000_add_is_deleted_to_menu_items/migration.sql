-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "menu_items_restaurant_id_is_deleted_idx" ON "menu_items"("restaurant_id", "is_deleted");
