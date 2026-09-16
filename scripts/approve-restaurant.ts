import {
	OnboardingStatus,
	PrismaClient,
	RestaurantStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	const email =
		process.argv[2] ||
		process.env.TEST_RESTAURANT_EMAIL ||
		"ajexjoshywork@gmail.com";

	console.log(`\nFinding/Updating restaurant for email: ${email}...`);

	const restaurant = await prisma.restaurant.upsert({
		where: { email },
		update: {
			status: RestaurantStatus.APPROVED,
			onboardingStatus: OnboardingStatus.COMPLETED,
			emailVerifiedAt: new Date(),
			isSubscriptionActive: false,
			subscriptionPlanCode: null,
			subscriptionEndsAt: null,
			restaurantName: "Ajex Grand Bistro",
			ownerName: "Ajex Joshy",
			ownerEmail: email,
		},
		create: {
			restaurantName: "Ajex Grand Bistro",
			email,
			phone: "+919876543210",
			ownerName: "Ajex Joshy",
			ownerEmail: email,
			status: RestaurantStatus.APPROVED,
			onboardingStatus: OnboardingStatus.COMPLETED,
			emailVerifiedAt: new Date(),
			isSubscriptionActive: false,
		},
	});

	console.log(
		"\nRestaurant successfully approved and ready for subscription testing.",
	);
	console.log("------------------------------------------------------------");
	console.log(`Restaurant ID:        ${restaurant.id}`);
	console.log(`Restaurant Name:      ${restaurant.restaurantName}`);
	console.log(`Email:                ${restaurant.email}`);
	console.log(`Status:               ${restaurant.status}`);
	console.log(`Onboarding Status:    ${restaurant.onboardingStatus}`);
	console.log(`Subscription Active:  ${restaurant.isSubscriptionActive}`);
	console.log("------------------------------------------------------------\n");
}

main()
	.catch((err) => {
		console.error("Failed to approve restaurant:", err);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
