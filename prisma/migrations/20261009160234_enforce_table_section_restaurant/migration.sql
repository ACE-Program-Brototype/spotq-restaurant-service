/*
  Warnings:

  - A unique constraint covering the columns `[restaurant_id,id]` on the table `table_sections` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "tables" DROP CONSTRAINT "tables_section_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "table_sections_restaurant_id_id_key" ON "table_sections"("restaurant_id", "id");

-- CreateIndex
CREATE INDEX "tables_restaurant_id_section_id_idx" ON "tables"("restaurant_id", "section_id");

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_restaurant_id_section_id_fkey" FOREIGN KEY ("restaurant_id", "section_id") REFERENCES "table_sections"("restaurant_id", "id") ON DELETE NO ACTION ON UPDATE CASCADE;
