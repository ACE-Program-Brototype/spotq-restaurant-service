-- CreateEnum
CREATE TYPE "RestaurantStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "restaurants" (
    "id" UUID NOT NULL,
    "restaurantName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "ownerName" TEXT,
    "ownerEmail" TEXT,
    "seatingCapacity" INTEGER,
    "fssaiNumber" TEXT,
    "gstNumber" TEXT,
    "regNumber" TEXT,
    "cuisineType" TEXT,
    "passwordHash" TEXT,
    "status" "RestaurantStatus" NOT NULL DEFAULT 'PENDING',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_email_key" ON "restaurants"("email");
