/*
  Warnings:

  - You are about to drop the column `avatar` on the `restaurant_profile` table. All the data in the column will be lost.
  - You are about to drop the column `cover_image` on the `restaurant_profile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TableShape" AS ENUM ('SQUARE', 'CIRCLE');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'PARTIAL_OCCUPIED', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "restaurant_operating_hours" ADD COLUMN     "is_closed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "restaurant_profile" DROP COLUMN "avatar",
DROP COLUMN "cover_image",
ADD COLUMN     "average_cost" INTEGER DEFAULT 0,
ADD COLUMN     "cover_image_key" TEXT,
ADD COLUMN     "cuisine_type" TEXT;

-- AlterTable
ALTER TABLE "restaurant_settings" ADD COLUMN     "accepts_qr_orders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "accepts_queue" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "auto_accept_queue" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "loyalty_enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "last_login_at" TIMESTAMPTZ(3),
ADD COLUMN     "rejection_reason" TEXT;

-- AlterTable
ALTER TABLE "staff" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "table_sections" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "section_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "table_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tables" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "section_id" UUID,
    "table_number" VARCHAR(50) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 2,
    "current_occupancy" INTEGER NOT NULL DEFAULT 0,
    "table_shape" "TableShape" NOT NULL DEFAULT 'SQUARE',
    "status" "TableStatus" NOT NULL DEFAULT 'AVAILABLE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "table_sections_restaurant_id_idx" ON "table_sections"("restaurant_id");

-- CreateIndex
CREATE INDEX "tables_restaurant_id_status_idx" ON "tables"("restaurant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tables_restaurant_id_table_number_key" ON "tables"("restaurant_id", "table_number");

-- CreateIndex
CREATE INDEX "addons_restaurant_id_name_idx" ON "addons"("restaurant_id", "name");

-- CreateIndex
CREATE INDEX "menu_categories_restaurant_id_name_idx" ON "menu_categories"("restaurant_id", "name");

-- AddForeignKey
ALTER TABLE "table_sections" ADD CONSTRAINT "table_sections_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "table_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
