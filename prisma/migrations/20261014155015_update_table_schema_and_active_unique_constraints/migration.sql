/*
  Warnings:

  - You are about to drop the column `table_number` on the `tables` table. All the data in the column will be lost.
  - Added the required column `table_code` to the `tables` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tables"
RENAME COLUMN "table_number" TO "table_code";

ALTER TABLE "tables"
ADD CONSTRAINT "tables_capacity_positive"
CHECK ("capacity" > 0);

ALTER TABLE "tables"
ADD CONSTRAINT "tables_occupancy_nonnegative"
CHECK ("current_occupancy" >= 0);

ALTER TABLE "tables"
ADD CONSTRAINT "tables_occupancy_within_capacity"
CHECK ("current_occupancy" <= "capacity");

CREATE UNIQUE INDEX "tables_restaurant_table_code_active_key"
ON "tables" ("restaurant_id", "table_code")
WHERE "is_deleted" = false;

CREATE UNIQUE INDEX "table_sections_restaurant_section_name_active_key"
ON "table_sections" ("restaurant_id", "section_name")
WHERE "is_deleted" = false;
