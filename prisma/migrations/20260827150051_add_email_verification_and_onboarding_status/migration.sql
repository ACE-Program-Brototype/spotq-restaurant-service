/*
  Warnings:

  - You are about to drop the column `isVerified` on the `restaurants` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "restaurants" DROP COLUMN "isVerified",
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'PENDING';
