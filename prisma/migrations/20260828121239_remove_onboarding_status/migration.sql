/*
  Warnings:

  - You are about to drop the column `onboardingStatus` on the `restaurants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "restaurants" DROP COLUMN "onboardingStatus";

-- DropEnum
DROP TYPE "OnboardingStatus";
