import {
	PrismaClient,
	RestaurantStatus,
	StaffRole,
	StaffStatus,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	console.log("🌱 Starting SpotQ Restaurants and Staff Seeding...\n");

	const defaultPassword = process.env.SAMPLE_STAFF_PASSWORD || "Password@123";
	const saltRounds = 10;
	const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

	// 1. Seed Sample Restaurants
	const sampleRestaurants = [
		{
			id: "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			restaurantName: "SpotQ Grand Bistro",
			email: "sooryanarayanan1082004@gmail.com",
			phone: "+1234567801",
			ownerName: "John Owner",
			ownerEmail: "owner@spotq.com",
			seatingCapacity: 120,
			cuisineType: "Continental & Italian",
			status: RestaurantStatus.ACTIVE,
		},
		{
			id: "a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
			restaurantName: "SpotQ Spice Lounge",
			email: "spicelounge@spotq.com",
			phone: "+1234567802",
			ownerName: "Sarah Owner",
			ownerEmail: "sarah.owner@spotq.com",
			seatingCapacity: 80,
			cuisineType: "Indian & Asian Fusion",
			status: RestaurantStatus.ACTIVE,
		},
	];

	for (const restaurant of sampleRestaurants) {
		const seededRest = await prisma.restaurant.upsert({
			where: { id: restaurant.id },
			update: {
				restaurantName: restaurant.restaurantName,
				email: restaurant.email,
				phone: restaurant.phone,
				ownerName: restaurant.ownerName,
				ownerEmail: restaurant.ownerEmail,
				seatingCapacity: restaurant.seatingCapacity,
				cuisineType: restaurant.cuisineType,
				status: restaurant.status,
			},
			create: restaurant,
		});

		console.log(
			`🏢 Seeded Restaurant: ${seededRest.restaurantName} (ID: ${seededRest.id})`,
		);
	}

	const bistroId = sampleRestaurants[0].id;
	const spiceLoungeId = sampleRestaurants[1].id;

	// 2. Seed Sample Restaurant Staff
	const sampleStaffMembers = [
		// Staff for SpotQ Grand Bistro
		{
			id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			restaurantId: bistroId,
			fullname: "John Owner",
			email: "owner@spotq.com",
			phone: "+1234567890",
			avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
			passwordHash,
			role: StaffRole.STAFF,
			status: StaffStatus.ACTIVE,
		},
		{
			id: "b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
			restaurantId: bistroId,
			fullname: "Sarah Manager",
			email: "manager@spotq.com",
			phone: "+1234567891",
			avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
			passwordHash,
			role: StaffRole.STAFF,
			status: StaffStatus.ACTIVE,
		},
		{
			id: "b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
			restaurantId: bistroId,
			fullname: "Chef Gordon",
			email: "chef@spotq.com",
			phone: "+1234567892",
			avatarUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c",
			passwordHash,
			role: StaffRole.STAFF,
			status: StaffStatus.ACTIVE,
		},
		{
			id: "b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
			restaurantId: bistroId,
			fullname: "Alex Waiter",
			email: "waiter@spotq.com",
			phone: "+1234567893",
			avatarUrl: null,
			passwordHash,
			role: StaffRole.STAFF,
			status: StaffStatus.ACTIVE,
		},
		// SpotQ Official Staff Account for Testing Real Emails
		{
			id: "b8eebc99-9c0b-4ef8-bb6d-6bb9bd380a08",
			restaurantId: bistroId,
			fullname: "SpotQ Official",
			email: "spotqofficial@gmail.com",
			phone: "+1234567899",
			avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
			passwordHash,
			role: StaffRole.STAFF,
			status: StaffStatus.ACTIVE,
		},
		// Staff for SpotQ Spice Lounge
		{
			id: "b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
			restaurantId: spiceLoungeId,
			fullname: "Raj Manager",
			email: "manager.spice@spotq.com",
			phone: "+1234567895",
			avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
			passwordHash,
			role: StaffRole.STAFF,
			status: StaffStatus.ACTIVE,
		},
		{
			id: "b6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
			restaurantId: spiceLoungeId,
			fullname: "Chef Sanjeev",
			email: "chef.spice@spotq.com",
			phone: "+1234567896",
			avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
			passwordHash,
			role: StaffRole.STAFF,
			status: StaffStatus.ACTIVE,
		},
		// Inactive Test Account
		{
			id: "b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
			restaurantId: bistroId,
			fullname: "Emma Inactive",
			email: "inactive@spotq.com",
			phone: "+1234567894",
			avatarUrl: null,
			passwordHash,
			role: StaffRole.STAFF,
			status: StaffStatus.INACTIVE,
		},
	];

	console.log("\n👥 Seeding Restaurant Staff Members...");
	for (const staff of sampleStaffMembers) {
		const upserted = await prisma.restaurantStaff.upsert({
			where: { email: staff.email },
			update: {
				restaurantId: staff.restaurantId,
				fullname: staff.fullname,
				phone: staff.phone,
				avatarUrl: staff.avatarUrl,
				passwordHash: staff.passwordHash,
				role: staff.role,
				status: staff.status,
			},
			create: staff,
		});

		console.log(
			`   ✅ ${upserted.fullname.padEnd(16)} | ${upserted.email.padEnd(26)} | Role: ${upserted.role.padEnd(8)} | Status: ${upserted.status}`,
		);
	}

	console.log("\n🎉 Seeding completed successfully!");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("🔑 Available Staff Login Test Accounts:");
	console.log(
		"   • spotqofficial@gmail.com  (Password: " +
			defaultPassword +
			" | Grand Bistro - MANAGER)",
	);
	console.log(
		"   • owner@spotq.com          (Password: " +
			defaultPassword +
			" | Grand Bistro - OWNER)",
	);
	console.log(
		"   • manager@spotq.com        (Password: " +
			defaultPassword +
			" | Grand Bistro - MANAGER)",
	);
	console.log(
		"   • chef@spotq.com           (Password: " +
			defaultPassword +
			" | Grand Bistro - CHEF)",
	);
	console.log(
		"   • waiter@spotq.com         (Password: " +
			defaultPassword +
			" | Grand Bistro - WAITER)",
	);
	console.log(
		"   • manager.spice@spotq.com  (Password: " +
			defaultPassword +
			" | Spice Lounge - MANAGER)",
	);
	console.log(
		"   • chef.spice@spotq.com     (Password: " +
			defaultPassword +
			" | Spice Lounge - CHEF)",
	);
	console.log(
		"   • inactive@spotq.com       (Password: " +
			defaultPassword +
			" | INACTIVE - Expected 403)",
	);
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
	.catch((error) => {
		console.error("❌ Seeding failed:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
