import { PrismaClient, RestaurantStatus } from "@prisma/client";

const prisma = new PrismaClient();

const RESTAURANT_ID = process.argv[2];

if (!RESTAURANT_ID) {
	console.error("❌ Usage: pnpm restaurant:approve <restaurant-id>");
	process.exit(1);
}

async function main() {
	console.log(`🔍 Looking for restaurant: ${RESTAURANT_ID}...`);

	const existing = await prisma.restaurant.findUnique({
		where: { id: RESTAURANT_ID },
	});

	if (!existing) {
		console.error(`❌ Restaurant with ID ${RESTAURANT_ID} not found in database.`);
		process.exit(1);
	}

	console.log(`Current status: ${existing.status}`);

	const updated = await prisma.restaurant.update({
		where: { id: RESTAURANT_ID },
		data: {
			status: RestaurantStatus.APPROVED,
		},
	});

	console.log(`✅ Restaurant "${updated.restaurantName}" (${updated.id}) is now APPROVED.`);
}

main()
	.catch((err) => {
		console.error("❌ Error updating restaurant status:", err);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
