-- Rename legacy camelCase columns to the service-wide snake_case convention.
ALTER TABLE "restaurants"
  RENAME COLUMN "restaurantName" TO "restaurant_name";

ALTER TABLE "restaurants"
  RENAME COLUMN "ownerName" TO "owner_name";

ALTER TABLE "restaurants"
  RENAME COLUMN "ownerEmail" TO "owner_email";

ALTER TABLE "restaurants"
  RENAME COLUMN "onboardingStatus" TO "onboarding_status";

ALTER TABLE "restaurants"
  RENAME COLUMN "emailVerifiedAt" TO "email_verified_at";

ALTER TABLE "restaurants"
  RENAME COLUMN "isBlocked" TO "is_blocked";

ALTER TABLE "restaurants"
  RENAME COLUMN "blockReason" TO "block_reason";

ALTER TABLE "restaurants"
  RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "restaurants"
  RENAME COLUMN "updatedAt" TO "updated_at";

-- Create the normalized weekly schedule used by RestaurantOperatingHours.
CREATE TABLE "restaurant_operating_hours" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT false,
    "open_time" TIME(0),
    "close_time" TIME(0),

    CONSTRAINT "restaurant_operating_hours_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "restaurant_operating_hours_restaurant_id_day_of_week_key"
  ON "restaurant_operating_hours"("restaurant_id", "day_of_week");

ALTER TABLE "restaurant_operating_hours"
  ADD CONSTRAINT "restaurant_operating_hours_restaurant_id_fkey"
  FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;