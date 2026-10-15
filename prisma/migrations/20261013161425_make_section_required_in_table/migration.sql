/*
  Warnings:

  - Made the column `section_id` on table `tables` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tables" ALTER COLUMN "section_id" SET NOT NULL;
