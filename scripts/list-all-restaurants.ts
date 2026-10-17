import { prisma } from "../src/config/prisma.ts";

async function main() {
  const allRestaurants = await prisma.restaurant.findMany({
    select: {
      id: true,
      restaurantName: true,
      status: true,
      isBlocked: true,
      isSubscriptionActive: true,
      onboardingStatus: true,
      email: true,
    },
  });

  console.log("=== ALL RESTAURANTS IN DB ===");
  console.log(JSON.stringify(allRestaurants, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
