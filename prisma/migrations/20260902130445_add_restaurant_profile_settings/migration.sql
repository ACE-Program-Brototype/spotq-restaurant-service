/*
  Warnings:

  - You are about to drop the column `cuisineType` on the `restaurants` table. All the data in the column will be lost.
  - You are about to drop the column `fssaiNumber` on the `restaurants` table. All the data in the column will be lost.
  - You are about to drop the column `gstNumber` on the `restaurants` table. All the data in the column will be lost.
  - You are about to drop the column `regNumber` on the `restaurants` table. All the data in the column will be lost.
  - You are about to drop the column `seatingCapacity` on the `restaurants` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "restaurants" DROP COLUMN "cuisineType",
DROP COLUMN "fssaiNumber",
DROP COLUMN "gstNumber",
DROP COLUMN "regNumber",
DROP COLUMN "seatingCapacity",
ADD COLUMN     "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "restaurant_settings" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "is_opened" BOOLEAN NOT NULL DEFAULT false,
    "is_preorder" BOOLEAN NOT NULL DEFAULT false,
    "open_time" TIME(0),
    "close_time" TIME(0),
    "is_sunday" BOOLEAN NOT NULL DEFAULT false,
    "is_loyalty" BOOLEAN NOT NULL DEFAULT false,
    "cuisine_type" TEXT,
    "seating_capacity" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_profile" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "cover_image" TEXT,
    "avatar" TEXT,
    "description" TEXT,
    "fssai_number" TEXT,
    "register_number" TEXT,
    "gst_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_settings_restaurant_id_key" ON "restaurant_settings"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_profile_restaurant_id_key" ON "restaurant_profile"("restaurant_id");

-- AddForeignKey
ALTER TABLE "restaurant_settings" ADD CONSTRAINT "restaurant_settings_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_profile" ADD CONSTRAINT "restaurant_profile_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
