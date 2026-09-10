-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "staff_invitations" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "accepted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "staff_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_invitations_token_hash_key" ON "staff_invitations"("token_hash");

-- CreateIndex
CREATE INDEX "staff_invitations_restaurant_id_idx" ON "staff_invitations"("restaurant_id");

-- CreateIndex
CREATE INDEX "staff_invitations_email_idx" ON "staff_invitations"("email");

-- CreateIndex
CREATE INDEX "staff_invitations_status_idx" ON "staff_invitations"("status");

-- AddForeignKey
ALTER TABLE "staff_invitations" ADD CONSTRAINT "staff_invitations_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
