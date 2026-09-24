-- CreateTable
CREATE TABLE IF NOT EXISTS "staff" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "avatar_updated_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "staff_email_key" ON "staff"("email");

-- Insert distinct staff by email from restaurant_staff if any exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurant_staff' AND column_name = 'email') THEN
        INSERT INTO "staff" ("id", "email", "fullname", "phone", "password_hash", "avatar_updated_at", "created_at", "updated_at")
        SELECT DISTINCT ON (LOWER(TRIM("email")))
            gen_random_uuid(),
            LOWER(TRIM("email")),
            "fullname",
            "phone",
            "password_hash",
            "avatar_updated_at",
            "created_at",
            "updated_at"
        FROM "restaurant_staff"
        ORDER BY LOWER(TRIM("email")), "created_at" ASC
        ON CONFLICT ("email") DO NOTHING;
    END IF;
END $$;

-- AlterTable restaurant_staff
ALTER TABLE "restaurant_staff" ADD COLUMN IF NOT EXISTS "staff_id" UUID;
ALTER TABLE "restaurant_staff" ADD COLUMN IF NOT EXISTS "joined_at" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "restaurant_staff" ADD COLUMN IF NOT EXISTS "left_at" TIMESTAMPTZ(3);

-- Backfill staff_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurant_staff' AND column_name = 'email') THEN
        UPDATE "restaurant_staff" rs
        SET "staff_id" = s."id"
        FROM "staff" s
        WHERE LOWER(TRIM(rs."email")) = s."email" AND rs."staff_id" IS NULL;

        DELETE FROM "restaurant_staff" WHERE "staff_id" IS NULL;

        DROP INDEX IF EXISTS "restaurant_staff_restaurant_id_email_key";
        DROP INDEX IF EXISTS "restaurant_staff_email_idx";

        ALTER TABLE "restaurant_staff" 
            DROP COLUMN IF EXISTS "fullname",
            DROP COLUMN IF EXISTS "email",
            DROP COLUMN IF EXISTS "phone",
            DROP COLUMN IF EXISTS "password_hash",
            DROP COLUMN IF EXISTS "avatar_updated_at";
    END IF;
END $$;

ALTER TABLE "restaurant_staff" ALTER COLUMN "staff_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "restaurant_staff_staff_id_restaurant_id_key" ON "restaurant_staff"("staff_id", "restaurant_id");
CREATE INDEX IF NOT EXISTS "restaurant_staff_staff_id_idx" ON "restaurant_staff"("staff_id");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'restaurant_staff_staff_id_fkey'
    ) THEN
        ALTER TABLE "restaurant_staff" 
        ADD CONSTRAINT "restaurant_staff_staff_id_fkey" 
        FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
