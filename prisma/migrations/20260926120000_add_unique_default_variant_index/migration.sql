-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "menu_item_variants_single_default_idx" ON "menu_item_variants"("menu_item_id") WHERE "is_default" = true;
