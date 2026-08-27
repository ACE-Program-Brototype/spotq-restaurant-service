/*
  Warnings:

  - Made the column `phone` on table `restaurants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ownerName` on table `restaurants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ownerEmail` on table `restaurants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `passwordHash` on table `restaurants` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "restaurants" ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "ownerName" SET NOT NULL,
ALTER COLUMN "ownerEmail" SET NOT NULL,
ALTER COLUMN "passwordHash" SET NOT NULL;
