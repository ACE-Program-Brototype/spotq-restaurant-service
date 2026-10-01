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

	// 4. Seed Menu Categories
	console.log("\n📑 Seeding Menu Categories...");
	const sampleCategories = [
		// Grand Bistro Categories
		{
			id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01",
			restaurantId: bistroId,
			name: "Starters & Appetizers",
			description: "Crispy and fresh small plates to kickstart your meal",
			displayOrder: 0,
			isActive: true,
		},
		{
			id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c02",
			restaurantId: bistroId,
			name: "Main Course",
			description: "Chef-curated gourmet entrees and signature dishes",
			displayOrder: 1,
			isActive: true,
		},
		{
			id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c03",
			restaurantId: bistroId,
			name: "Desserts",
			description: "Decadent handcrafted sweets and confections",
			displayOrder: 2,
			isActive: true,
		},
		{
			id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c04",
			restaurantId: bistroId,
			name: "Beverages & Mocktails",
			description: "Refreshing artisanal drinks and signature refreshments",
			displayOrder: 3,
			isActive: true,
		},
		// Spice Lounge Categories
		{
			id: "b2eebc99-9c0b-4ef8-bb6d-6bb9bd380c01",
			restaurantId: spiceLoungeId,
			name: "Tandoori Starters",
			description: "Clay-oven smoked and spiced delicacies",
			displayOrder: 0,
			isActive: true,
		},
		{
			id: "b2eebc99-9c0b-4ef8-bb6d-6bb9bd380c02",
			restaurantId: spiceLoungeId,
			name: "Curries & Breads",
			description: "Aromatic regional gravies and fresh tandoor breads",
			displayOrder: 1,
			isActive: true,
		},
		{
			id: "b2eebc99-9c0b-4ef8-bb6d-6bb9bd380c03",
			restaurantId: spiceLoungeId,
			name: "Biryani Specials",
			description: "Slow-cooked dum biryanis with fragrant long-grain basmati",
			displayOrder: 2,
			isActive: true,
		},
	];

	for (const cat of sampleCategories) {
		const seededCat = await prisma.menuCategory.upsert({
			where: { id: cat.id },
			update: {
				name: cat.name,
				description: cat.description,
				displayOrder: cat.displayOrder,
				isActive: cat.isActive,
			},
			create: cat,
		});
		console.log(
			`   📂 Category: ${seededCat.name.padEnd(24)} | Rest: ${seededCat.restaurantId.slice(-6)}`,
		);
	}

	// 5. Seed Addons
	console.log("\n🧀 Seeding Addons...");
	const sampleAddons = [
		{
			id: "e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			restaurantId: bistroId,
			name: "Extra Truffle Dip",
			description: "House-made black truffle aioli",
			price: 2.5,
			imageKey: "addons/bistro/truffle-dip.jpg",
			isAvailable: true,
		},
		{
			id: "e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
			restaurantId: bistroId,
			name: "Aged Cheddar Slice",
			description: "Melted sharp aged cheddar",
			price: 1.5,
			imageKey: "addons/bistro/aged-cheddar.jpg",
			isAvailable: true,
		},
		{
			id: "e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
			restaurantId: bistroId,
			name: "Crispy Bacon Strip",
			description: "Hardwood smoked bacon",
			price: 3.0,
			imageKey: "addons/bistro/bacon.jpg",
			isAvailable: true,
		},
		{
			id: "e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			restaurantId: spiceLoungeId,
			name: "Extra Boondi Raita",
			description: "Cooling spiced yogurt",
			price: 1.0,
			imageKey: "addons/spice/raita.jpg",
			isAvailable: true,
		},
		{
			id: "e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
			restaurantId: spiceLoungeId,
			name: "Fresh Mint Chutney",
			description: "Tangy coriander and mint dip",
			price: 0.5,
			imageKey: "addons/spice/mint-chutney.jpg",
			isAvailable: true,
		},
	];

	for (const addon of sampleAddons) {
		const seededAddon = await prisma.addon.upsert({
			where: { id: addon.id },
			update: {
				name: addon.name,
				description: addon.description,
				price: addon.price,
				imageKey: addon.imageKey,
				isAvailable: addon.isAvailable,
			},
			create: addon,
		});
		console.log(
			`   ✨ Addon: ${seededAddon.name.padEnd(20)} | $${Number(seededAddon.price).toFixed(2)} | Rest: ${seededAddon.restaurantId.slice(-6)}`,
		);
	}

	// 6. Seed Menu Items
	console.log("\n🍔 Seeding Menu Items...");
	const sampleMenuItems = [
		// Grand Bistro Items
		{
			id: "f1eebc99-9c0b-4ef8-bb6d-6bb9bd380001",
			restaurantId: bistroId,
			categoryId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c02", // Main Course
			name: "Smoked Wagyu Burger",
			description:
				"Brioche bun, prime wagyu patty, caramelized onions, smoked gouda, and truffle mayonnaise",
			price: 22.0,
			preparationTime: 15,
			calories: 850,
			isVegetarian: false,
			isFeatured: true,
			isAvailable: true,
			isDeleted: false,
			images: [
				{
					id: "11eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
					objectKey: "menu/bistro/wagyu-burger-1.jpg",
					displayOrder: 0,
				},
				{
					id: "11eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
					objectKey: "menu/bistro/wagyu-burger-2.jpg",
					displayOrder: 1,
				},
			],
			variants: [
				{
					id: "21eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
					name: "Single Patty",
					price: 22.0,
					sku: "WAGYU-SGL",
					isDefault: true,
				},
				{
					id: "21eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
					name: "Double Patty",
					price: 28.5,
					sku: "WAGYU-DBL",
					isDefault: false,
				},
			],
			addons: [
				"e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
				"e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
				"e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
			],
		},
		{
			id: "f1eebc99-9c0b-4ef8-bb6d-6bb9bd380002",
			restaurantId: bistroId,
			categoryId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c02", // Main Course
			name: "Truffle Mushroom Tagliatelle",
			description:
				"Handcrafted egg pasta tossed in wild forest mushrooms, parmigiano reggiano, and black truffle oil",
			price: 18.5,
			preparationTime: 20,
			calories: 680,
			isVegetarian: true,
			isFeatured: true,
			isAvailable: true,
			isDeleted: false,
			images: [
				{
					id: "11eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
					objectKey: "menu/bistro/tagliatelle.jpg",
					displayOrder: 0,
				},
			],
			variants: [],
			addons: ["e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01"],
		},
		{
			id: "f1eebc99-9c0b-4ef8-bb6d-6bb9bd380003",
			restaurantId: bistroId,
			categoryId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01", // Starters
			name: "Crispy Calamari Fritti",
			description:
				"Golden flash-fried squid rings served with lemon herb caper emulsion and spicy marinara",
			price: 12.0,
			preparationTime: 12,
			calories: 420,
			isVegetarian: false,
			isFeatured: false,
			isAvailable: true,
			isDeleted: false,
			images: [
				{
					id: "11eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
					objectKey: "menu/bistro/calamari.jpg",
					displayOrder: 0,
				},
			],
			variants: [],
			addons: [],
		},
		{
			id: "f1eebc99-9c0b-4ef8-bb6d-6bb9bd380004",
			restaurantId: bistroId,
			categoryId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01", // Starters
			name: "Artisan Garlic Sourdough",
			description:
				"Toasted naturally fermented sourdough brushed with roasted confit garlic and herb butter",
			price: 6.5,
			preparationTime: 10,
			calories: 310,
			isVegetarian: true,
			isFeatured: false,
			isAvailable: false, // Out of stock
			isDeleted: false,
			images: [
				{
					id: "11eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
					objectKey: "menu/bistro/garlic-bread.jpg",
					displayOrder: 0,
				},
			],
			variants: [],
			addons: ["e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02"],
		},
		{
			id: "f1eebc99-9c0b-4ef8-bb6d-6bb9bd380005",
			restaurantId: bistroId,
			categoryId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c02", // Main Course
			name: "Classic Neapolitan Margherita",
			description:
				"San Marzano tomato base, fresh buffalo mozzarella, fragrant sweet basil, and extra virgin olive oil",
			price: 15.0,
			preparationTime: 18,
			calories: 720,
			isVegetarian: true,
			isFeatured: true,
			isAvailable: true,
			isDeleted: false,
			images: [
				{
					id: "11eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
					objectKey: "menu/bistro/margherita.jpg",
					displayOrder: 0,
				},
			],
			variants: [
				{
					id: "21eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
					name: '10" Medium',
					price: 15.0,
					sku: "PIZZA-MARG-10",
					isDefault: true,
				},
				{
					id: "21eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
					name: '14" Large',
					price: 21.0,
					sku: "PIZZA-MARG-14",
					isDefault: false,
				},
			],
			addons: [
				"e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
				"e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
			],
		},
		{
			id: "f1eebc99-9c0b-4ef8-bb6d-6bb9bd380006",
			restaurantId: bistroId,
			categoryId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c03", // Desserts
			name: "Espresso Tiramisu Classico",
			description:
				"Layers of Savoiardi ladyfingers soaked in dark roast espresso and velvety mascarpone cream",
			price: 9.0,
			preparationTime: 5,
			calories: 450,
			isVegetarian: true,
			isFeatured: false,
			isAvailable: true,
			isDeleted: false,
			images: [
				{
					id: "11eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
					objectKey: "menu/bistro/tiramisu.jpg",
					displayOrder: 0,
				},
			],
			variants: [],
			addons: [],
		},
		{
			id: "f1eebc99-9c0b-4ef8-bb6d-6bb9bd380007",
			restaurantId: bistroId,
			categoryId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c04", // Beverages
			name: "Wild Berry Sparkler",
			description:
				"Muddled seasonal berries, mint, lime, and sparkling water infused with elderflower cordial",
			price: 7.5,
			preparationTime: 5,
			calories: 180,
			isVegetarian: true,
			isFeatured: false,
			isAvailable: true,
			isDeleted: false,
			images: [
				{
					id: "11eebc99-9c0b-4ef8-bb6d-6bb9bd380a08",
					objectKey: "menu/bistro/berry-sparkler.jpg",
					displayOrder: 0,
				},
			],
			variants: [],
			addons: [],
		},
		{
			id: "f1eebc99-9c0b-4ef8-bb6d-6bb9bd380008",
			restaurantId: bistroId,
			categoryId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c03", // Desserts
			name: "Molten Valrhona Lava Cake",
			description:
				"Warm chocolate cake with an oozing liquid ganache core, served with bourbon vanilla bean gelato",
			price: 10.5,
			preparationTime: 15,
			calories: 590,
			isVegetarian: true,
			isFeatured: true,
			isAvailable: false, // Out of stock
			isDeleted: false,
			images: [
				{
					id: "11eebc99-9c0b-4ef8-bb6d-6bb9bd380a09",
					objectKey: "menu/bistro/lava-cake.jpg",
					displayOrder: 0,
				},
			],
			variants: [],
			addons: [],
		},

		// Spice Lounge Items
		{
			id: "f2eebc99-9c0b-4ef8-bb6d-6bb9bd380001",
			restaurantId: spiceLoungeId,
			categoryId: "b2eebc99-9c0b-4ef8-bb6d-6bb9bd380c03", // Biryani Specials
			name: "Hyderabadi Dum Gosht Biryani",
			description:
				"Tender goat meat cooked in copper handi with aged basmati rice, caramelized onions, and saffron milk",
			price: 19.5,
			preparationTime: 25,
			calories: 780,
			isVegetarian: false,
			isFeatured: true,
			isAvailable: true,
			isDeleted: false,
			images: [
				{
					id: "12eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
					objectKey: "menu/spice/gosht-biryani.jpg",
					displayOrder: 0,
				},
			],
			variants: [
				{
					id: "22eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
					name: "Regular Portion",
					price: 19.5,
					sku: "BIRYANI-REG",
					isDefault: true,
				},
				{
					id: "22eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
					name: "Jumbo Family Pack",
					price: 42.0,
					sku: "BIRYANI-JMB",
					isDefault: false,
				},
			],
			addons: [
				"e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
				"e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
			],
		},
		{
			id: "f2eebc99-9c0b-4ef8-bb6d-6bb9bd380002",
			restaurantId: spiceLoungeId,
			categoryId: "b2eebc99-9c0b-4ef8-bb6d-6bb9bd380c01", // Tandoori Starters
			name: "Malai Paneer Tikka",
			description:
				"Fresh cottage cheese cubes marinated in rich cashew cream, green cardamom, and char-grilled in clay tandoor",
			price: 13.5,
			preparationTime: 15,
			calories: 520,
			isVegetarian: true,
			isFeatured: true,
			isAvailable: true,
			isDeleted: false,
			images: [
				{
					id: "12eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
					objectKey: "menu/spice/paneer-tikka.jpg",
					displayOrder: 0,
				},
			],
			variants: [],
			addons: ["e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02"],
		},
		{
			id: "f2eebc99-9c0b-4ef8-bb6d-6bb9bd380003",
			restaurantId: spiceLoungeId,
			categoryId: "b2eebc99-9c0b-4ef8-bb6d-6bb9bd380c02", // Curries & Breads
			name: "Tandoori Butter Garlic Naan",
			description:
				"Leavened flatbread baked on tandoor walls, topped with crushed roasted garlic, cilantro, and pure butter",
			price: 4.5,
			preparationTime: 8,
			calories: 280,
			isVegetarian: true,
			isFeatured: false,
			isAvailable: false, // Out of stock
			isDeleted: false,
			images: [
				{
					id: "12eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
					objectKey: "menu/spice/garlic-naan.jpg",
					displayOrder: 0,
				},
			],
			variants: [],
			addons: [],
		},
	];

	for (const item of sampleMenuItems) {
		const { images, variants, addons, ...itemData } = item;
		const seededItem = await prisma.menuItem.upsert({
			where: { id: itemData.id },
			update: {
				name: itemData.name,
				description: itemData.description,
				price: itemData.price,
				preparationTime: itemData.preparationTime,
				calories: itemData.calories,
				isVegetarian: itemData.isVegetarian,
				isFeatured: itemData.isFeatured,
				isAvailable: itemData.isAvailable,
				categoryId: itemData.categoryId,
			},
			create: {
				...itemData,
				isDeleted: itemData.isDeleted ?? false,
			},
		});

		// Upsert images
		for (const img of images) {
			await prisma.menuItemImage.upsert({
				where: { id: img.id },
				update: {
					objectKey: img.objectKey,
					displayOrder: img.displayOrder,
				},
				create: {
					id: img.id,
					menuItemId: seededItem.id,
					objectKey: img.objectKey,
					displayOrder: img.displayOrder,
				},
			});
		}

		// Upsert variants
		for (const variant of variants) {
			await prisma.menuItemVariant.upsert({
				where: { id: variant.id },
				update: {
					name: variant.name,
					price: variant.price,
					sku: variant.sku,
					isDefault: variant.isDefault,
				},
				create: {
					id: variant.id,
					menuItemId: seededItem.id,
					name: variant.name,
					price: variant.price,
					sku: variant.sku,
					isDefault: variant.isDefault,
				},
			});
		}

		// Upsert addons junction
		for (const addonId of addons) {
			await prisma.menuItemAddon.upsert({
				where: {
					menuItemId_addonId: {
						menuItemId: seededItem.id,
						addonId,
					},
				},
				update: {},
				create: {
					menuItemId: seededItem.id,
					addonId,
				},
			});
		}

		const statusIcon = seededItem.isDeleted
			? "🗑️"
			: seededItem.isAvailable
				? "🟢"
				: "🔴";
		console.log(
			`   🍽️ ${statusIcon} ${seededItem.name.padEnd(30)} | $${Number(seededItem.price).toFixed(2).padStart(5)} | Prep: ${String(seededItem.preparationTime).padStart(2)}m | Cal: ${String(seededItem.calories).padStart(3)} | Rest: ${seededItem.restaurantId.slice(-6)}`,
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
