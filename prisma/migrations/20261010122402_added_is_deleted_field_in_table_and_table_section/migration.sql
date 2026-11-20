-- DropIndex
DROP INDEX "table_sections_restaurant_id_idx";

-- DropIndex
DROP INDEX "tables_restaurant_id_table_number_key";

-- AlterTable
ALTER TABLE "table_sections" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tables" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "table_sections_restaurant_id_is_deleted_idx" ON "table_sections"("restaurant_id", "is_deleted");
