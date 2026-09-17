-- DropIndex
DROP INDEX IF EXISTS "restaurant_staff_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_staff_restaurant_id_email_key" ON "restaurant_staff"("restaurant_id", "email");
