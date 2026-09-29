-- CreateTable
CREATE TABLE "addons" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "image_key" VARCHAR(500),
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "addons_pkey" PRIMARY KEY ("id")
);

-- DropForeignKey
ALTER TABLE "menu_item_addons" DROP CONSTRAINT IF EXISTS "menu_item_addons_menu_item_id_fkey";

-- DropTable
DROP TABLE IF EXISTS "menu_item_addons";

-- CreateTable
CREATE TABLE "menu_item_addons" (
    "id" UUID NOT NULL,
    "menu_item_id" UUID NOT NULL,
    "addon_id" UUID NOT NULL,
    "price_override" DECIMAL(10,2),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "menu_item_addons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "addons_restaurant_id_name_key" ON "addons"("restaurant_id", "name");
CREATE INDEX "addons_restaurant_id_idx" ON "addons"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "menu_item_addons_menu_item_id_addon_id_key" ON "menu_item_addons"("menu_item_id", "addon_id");
CREATE INDEX "menu_item_addons_menu_item_id_idx" ON "menu_item_addons"("menu_item_id");
CREATE INDEX "menu_item_addons_addon_id_idx" ON "menu_item_addons"("addon_id");

-- AddForeignKey
ALTER TABLE "addons" ADD CONSTRAINT "addons_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_addons" ADD CONSTRAINT "menu_item_addons_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_addons" ADD CONSTRAINT "menu_item_addons_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "addons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "addons" ADD CONSTRAINT "addons_price_check" CHECK ("price" >= 0);
ALTER TABLE "menu_item_addons" ADD CONSTRAINT "menu_item_addons_price_override_check" CHECK ("price_override" IS NULL OR "price_override" >= 0);
