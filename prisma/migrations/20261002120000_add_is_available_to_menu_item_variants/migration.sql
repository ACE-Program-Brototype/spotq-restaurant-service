-- AlterTable
ALTER TABLE "menu_item_variants" ADD COLUMN "is_available" BOOLEAN NOT NULL DEFAULT true;

-- Backfill variant availability from parent menu items
UPDATE "menu_item_variants" v
SET "is_available" = m."is_available"
FROM "menu_items" m
WHERE v."menu_item_id" = m."id";

