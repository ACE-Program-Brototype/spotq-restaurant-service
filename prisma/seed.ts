import {
	OnboardingStatus,
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
			status: RestaurantStatus.APPROVED,
			onboardingStatus: OnboardingStatus.COMPLETED,
			isSubscriptionActive: true,
			isBlocked: false,
			emailVerifiedAt: new Date(),
		},
		{
			id: "a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
			restaurantName: "SpotQ Spice Lounge",
			email: "spicelounge@spotq.com",
			phone: "+1234567802",
			ownerName: "Sarah Owner",
			ownerEmail: "sarah.owner@spotq.com",
			status: RestaurantStatus.APPROVED,
			onboardingStatus: OnboardingStatus.COMPLETED,
			isSubscriptionActive: true,
			isBlocked: false,
			emailVerifiedAt: new Date(),
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
				status: restaurant.status,
				onboardingStatus: restaurant.onboardingStatus,
				isSubscriptionActive: restaurant.isSubscriptionActive,
				isBlocked: restaurant.isBlocked,
				emailVerifiedAt: restaurant.emailVerifiedAt,
			},
			create: restaurant,
		});

		console.log(
			`🏢 Seeded Restaurant: ${seededRest.restaurantName} (ID: ${seededRest.id})`,
		);
	}

	const bistroId = sampleRestaurants[0].id;
	const spiceLoungeId = sampleRestaurants[1].id;

	// 2. Seed Global Staff Identities
	console.log("\n👤 Seeding Global Staff Identities...");
	const globalStaffList = [
		// Multi-restaurant staff account
		{
			id: "c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			email: "multistaff@spotq.com",
			fullname: "Alex Multi",
			phone: "+919876543210",
			passwordHash,
		},
		// Single-restaurant staff accounts
		{
			id: "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
			email: "manager@spotq.com",
			fullname: "Sarah Manager",
			phone: "+919876543211",
			passwordHash,
		},
		{
			id: "c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
			email: "manager.spice@spotq.com",
			fullname: "Raj Manager",
			phone: "+919876543212",
			passwordHash,
		},
		{
			id: "c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
			email: "spotqofficial@gmail.com",
			fullname: "SpotQ Official",
			phone: "+919876543213",
			passwordHash,
		},
		{
			id: "c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
			email: "owner@spotq.com",
			fullname: "John Owner",
			phone: "+919876543214",
			passwordHash,
		},
		{
			id: "c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
			email: "chef@spotq.com",
			fullname: "Chef Gordon",
			phone: "+919876543215",
			passwordHash,
		},
		{
			id: "c7eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
			email: "waiter@spotq.com",
			fullname: "Alex Waiter",
			phone: "+919876543216",
			passwordHash,
		},
		{
			id: "c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a08",
			email: "inactive@spotq.com",
			fullname: "Emma Inactive",
			phone: "+919876543217",
			passwordHash,
		},
	];

	for (const staff of globalStaffList) {
		const seededGlobal = await prisma.staff.upsert({
			where: { email: staff.email },
			update: {
				fullname: staff.fullname,
				phone: staff.phone,
				passwordHash: staff.passwordHash,
			},
			create: staff,
		});

		console.log(
			`   👤 Global Staff: ${seededGlobal.fullname.padEnd(16)} | ${seededGlobal.email.padEnd(26)} (ID: ${seededGlobal.id})`,
		);
	}

	// 3. Seed RestaurantStaff Memberships
	console.log("\n👥 Seeding RestaurantStaff Memberships...");
	const sampleMemberships = [
		// --- MULTI-RESTAURANT STAFF: Alex Multi is member of BOTH restaurants ---
		{
			id: "d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			staffId: "c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			restaurantId: bistroId,
			role: StaffRole.STAFF,
			status: StaffStatus.ACTIVE,
			fullname: "Alex Multi",
			email: "multistaff@spotq.com",
			phone: "+919876543210",
			passwordHash,
		},
		{
			id: "d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
			staffId: "c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			restaurantId: spiceLoungeId,
			role: StaffRole.STAFF,
			status: StaffStatus.ACTIVE,
			fullname: "Alex Multi",
			email: "multistaff@spotq.com",
			phone: "+919876543210",
			passwordHash,
		},

		// --- SINGLE-RESTAURANT STAFF: Sarah Manager at Grand Bistro ONLY ---
		{
			id: "d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			staffId: "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
			restaurantId: bistroId,
			role: StaffRole.STAFF,
			status: StaffStatus.ACTIVE,
			fullname: "Sarah Manager",
			email: "manager@spotq.com",
			phone: "+919876543211",
			passwordHash,
		},

		// --- SINGLE-RESTAURANT STAFF: Raj Manager at Spice Lounge ONLY ---
		{
			id: "d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			staffId: "c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
			restaurantId: spiceLoungeId,
			role: StaffRole.STAFF,
			status: StaffStatus.ACTIVE,
			fullname: "Raj Manager",
			email: "manager.spice@spotq.com",
			phone: "+919876543212",
			passwordHash,
		},

		// Other accounts
		{
			id: "d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			staffId: "c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
			restaurantId: bistroId,
			role: StaffRole.STAFF,
			status: StaffStatus.ACTIVE,
			fullname: "SpotQ Official",
			email: "spotqofficial@gmail.com",
			phone: "+919876543213",
			passwordHash,
		},
		{
			id: "d5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
			staffId: "c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
			restaurantId: bistroId,
			role: StaffRole.STAFF,
			status: StaffStatus.ACTIVE,
			fullname: "John Owner",
			email: "owner@spotq.com",
			phone: "+919876543214",
			passwordHash,
		},
		{
			id: "d6eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			staffId: "c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
			restaurantId: bistroId,
			role: StaffRole.STAFF,
			status: StaffStatus.ACTIVE,
			fullname: "Chef Gordon",
			email: "chef@spotq.com",
			phone: "+919876543215",
			passwordHash,
		},
		{
			id: "d7eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			staffId: "c7eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
			restaurantId: bistroId,
			role: StaffRole.STAFF,
			status: StaffStatus.ACTIVE,
			fullname: "Alex Waiter",
			email: "waiter@spotq.com",
			phone: "+919876543216",
			passwordHash,
		},
		// Inactive Account
		{
			id: "d8eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			staffId: "c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a08",
			restaurantId: bistroId,
			role: StaffRole.STAFF,
			status: StaffStatus.INACTIVE,
			fullname: "Emma Inactive",
			email: "inactive@spotq.com",
			phone: "+919876543217",
			passwordHash,
		},
	];

	for (const membership of sampleMemberships) {
		const upserted = await prisma.restaurantStaff.upsert({
			where: {
				staffId_restaurantId: {
					staffId: membership.staffId,
					restaurantId: membership.restaurantId,
				},
			},
			update: {
				role: membership.role,
				status: membership.status,
				leftAt: membership.status === StaffStatus.ACTIVE ? null : new Date(),
			},
			create: {
				id: membership.id,
				staffId: membership.staffId,
				restaurantId: membership.restaurantId,
				role: membership.role,
				status: membership.status,
				joinedAt: new Date(),
			},
		});

		console.log(
			`   ✅ ${membership.fullname?.padEnd(16)} | ${membership.email?.padEnd(26)} | Rest: ${upserted.restaurantId.slice(-6)} | Role: ${upserted.role.padEnd(8)} | Status: ${upserted.status}`,
		);
	}

	console.log("\n🎉 Seeding completed successfully!");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("🔑 Available Staff Login Test Accounts:");
	console.log(
		"   • multistaff@spotq.com     (Password: " +
			defaultPassword +
			" | MULTIPLE RESTAURANTS: Grand Bistro & Spice Lounge)",
	);
	console.log(
		"   • manager@spotq.com        (Password: " +
			defaultPassword +
			" | SINGLE RESTAURANT: Grand Bistro - Normal login)",
	);
	console.log(
		"   • manager.spice@spotq.com  (Password: " +
			defaultPassword +
			" | SINGLE RESTAURANT: Spice Lounge - Normal login)",
	);
	console.log(
		"   • spotqofficial@gmail.com  (Password: " +
			defaultPassword +
			" | Grand Bistro)",
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
