import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Prisma, type PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import {
	AddonNotFoundForRestaurantError,
	CategoryNotFoundError,
	InvalidVariantDataError,
	MenuItemAlreadyExistsError,
	MenuItemNotFoundError,
} from "@/domain/errors/menu-item.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import { PrismaMenuItemRepository } from "@/infrastructure/database/repositories/prisma-menu-item.repository.ts";

describe("PrismaMenuItemRepository", () => {
	let mockPrisma: {
		menuItem: {
			create: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			findUnique: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			findFirst: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			findMany: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			count: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			update: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
		};
		menuCategory: {
			findFirst: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			count: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
		};
		addon: {
			count: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			findMany: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
		};
		$transaction: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
	};
	let repository: PrismaMenuItemRepository;

	const now = new Date();
	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const categoryId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

	const rawMenuItem = {
		id: "m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
		restaurantId,
		categoryId,
		name: "Wagyu Burger",
		description: "Prime burger",
		price: new Prisma.Decimal(22.5),
		preparationTime: 15,
		calories: 850,
		isVegetarian: false,
		isFeatured: true,
		isAvailable: true,
		createdAt: now,
		updatedAt: now,
	};

	const rawMenuItemWithRelations = {
		...rawMenuItem,
		category: {
			name: "Main Course",
		},
		images: [
			{
				id: "img-1",
				objectKey: "menu/burger.jpg",
				displayOrder: 0,
			},
		],
	};

	beforeEach(() => {
		mockPrisma = {
			menuItem: {
				create: jest.fn(),
				findUnique: jest.fn(),
				findFirst: jest.fn(),
				findMany: jest.fn(),
				count: jest.fn(),
				update: jest.fn(),
			},
			menuCategory: {
				findFirst: jest.fn(),
				count: jest.fn(),
			},
			addon: {
				count: jest.fn(),
				findMany: jest.fn(),
			},
			$transaction: jest.fn(),
		};

		repository = new PrismaMenuItemRepository(
			mockPrisma as unknown as PrismaClient,
		);
	});

	describe("findByNameAndRestaurantId", () => {
		it("should find menuItem by name and restaurantId case-insensitively", async () => {
			mockPrisma.menuItem.findFirst.mockResolvedValue(rawMenuItem);

			const result = await repository.findByNameAndRestaurantId(
				restaurantId,
				"wagyu burger",
			);

			expect(result).toBeInstanceOf(MenuItem);
			expect(result?.name).toBe("Wagyu Burger");
			expect(mockPrisma.menuItem.findFirst).toHaveBeenCalledWith({
				where: {
					restaurantId,
					name: {
						equals: "wagyu burger",
						mode: "insensitive",
					},
				},
			});
		});

		it("should return null if no item found", async () => {
			mockPrisma.menuItem.findFirst.mockResolvedValue(null);

			const result = await repository.findByNameAndRestaurantId(
				restaurantId,
				"nonexistent",
			);

			expect(result).toBeNull();
		});
	});

	describe("findById", () => {
		it("should find menu item by id", async () => {
			mockPrisma.menuItem.findUnique.mockResolvedValue(rawMenuItem);

			const result = await repository.findById("item-123");

			expect(result).toBeDefined();
			expect(result?.id).toBe(rawMenuItem.id);
		});

		it("should return null if menu item not found", async () => {
			mockPrisma.menuItem.findUnique.mockResolvedValue(null);

			const result = await repository.findById("non-existent");
			expect(result).toBeNull();
		});
	});

	describe("createWithDetails", () => {
		it("should create menu item with details inside transaction", async () => {
			const mockTx = {
				menuItem: {
					create:
						jest.fn<() => Promise<unknown>>().mockResolvedValue(rawMenuItem),
				},
				menuItemImage: {
					create: jest.fn<() => Promise<unknown>>().mockResolvedValue({
						id: "img-1",
						menuItemId: rawMenuItem.id,
						objectKey: "menu/biryani.png",
						displayOrder: 0,
						createdAt: now,
					}),
				},
				menuItemVariant: {
					create: jest.fn<() => Promise<unknown>>().mockResolvedValue({
						id: "var-1",
						menuItemId: rawMenuItem.id,
						sku: "BIRYANI-FULL",
						name: "Full Portion",
						price: new Prisma.Decimal(320.0),
						isDefault: true,
						createdAt: now,
						updatedAt: now,
					}),
				},
				menuItemAddon: {
					create: jest.fn<() => Promise<unknown>>().mockResolvedValue({
						id: "junc-1",
						menuItemId: rawMenuItem.id,
						addonId: "addon-1",
						priceOverride: new Prisma.Decimal(40.0),
					}),
				},
				addon: {
					findMany: jest.fn<() => Promise<unknown>>().mockResolvedValue([
						{
							id: "addon-1",
							name: "Extra Raita",
							price: new Prisma.Decimal(30.0),
						},
					]),
				},
			};

			mockPrisma.$transaction.mockImplementation(async (callback: unknown) => {
				return (callback as (tx: unknown) => Promise<unknown>)(mockTx);
			});

			const domainItem = MenuItem.create({
				restaurantId: rawMenuItem.restaurantId,
				categoryId: rawMenuItem.categoryId,
				name: rawMenuItem.name,
				price: 320.0,
			});

			const domainVariant = MenuItemVariant.create({
				menuItemId: domainItem.id,
				name: "Full Portion",
				price: 320.0,
				isDefault: true,
			});

			const aggregate = await repository.createWithDetails({
				menuItem: domainItem,
				images: [{ objectKey: "menu/biryani.png", displayOrder: 0 }],
				variants: [domainVariant],
				addons: [{ addonId: "addon-1", priceOverride: 40.0 }],
			});

			expect(aggregate).toBeDefined();
			expect(aggregate.item.id).toBe(rawMenuItem.id);
			expect(aggregate.images).toHaveLength(1);
			expect(aggregate.variants).toHaveLength(1);
			expect(aggregate.addons).toHaveLength(1);
		});
	});

	describe("getRestaurantMenuStats", () => {
		it("should return restaurant menu KPI counts", async () => {
			mockPrisma.menuCategory.count.mockResolvedValue(4);
			mockPrisma.menuItem.count
				.mockResolvedValueOnce(12)
				.mockResolvedValueOnce(10)
				.mockResolvedValueOnce(2);

			const stats = await repository.getRestaurantMenuStats(restaurantId);

			expect(stats.totalCategories).toBe(4);
			expect(stats.totalMenuItems).toBe(12);
			expect(stats.availableItems).toBe(10);
			expect(stats.outOfStockItems).toBe(2);
		});
	});

	describe("findManyWithFiltersAndStats", () => {
		it("should query items with filters, relations, and stats", async () => {
			mockPrisma.menuItem.findMany.mockResolvedValue([
				rawMenuItemWithRelations,
			]);
			mockPrisma.menuItem.count
				.mockResolvedValueOnce(1)
				.mockResolvedValueOnce(10)
				.mockResolvedValueOnce(8)
				.mockResolvedValueOnce(2);
			mockPrisma.menuCategory.count.mockResolvedValue(3);

			const result = await repository.findManyWithFiltersAndStats({
				restaurantId,
				categoryId,
				search: "burger",
				isAvailable: true,
				isVegetarian: false,
				isFeatured: true,
				minPrice: 10,
				maxPrice: 30,
				sortBy: "price",
				sortOrder: "asc",
				page: 1,
				limit: 10,
			});

			expect(result.items).toHaveLength(1);
			expect(result.items[0].name).toBe("Wagyu Burger");
			expect(result.items[0].categoryName).toBe("Main Course");
			expect(result.items[0].image).toBe("menu/burger.jpg");
			expect(result.total).toBe(1);
			expect(result.stats.totalCategories).toBe(3);
			expect(result.stats.totalMenuItems).toBe(10);
			expect(result.stats.availableItems).toBe(8);
			expect(result.stats.outOfStockItems).toBe(2);
		});
	});

	describe("handlePrismaError", () => {
		it("should map P2002 error to MenuItemAlreadyExistsError", async () => {
			const p2002Error = new PrismaClientKnownRequestError(
				"Unique constraint failed",
				{
					code: "P2002",
					clientVersion: "6.0.0",
				},
			);
			mockPrisma.menuItem.findFirst.mockRejectedValue(p2002Error);

			await expect(
				repository.findByNameAndRestaurantId(restaurantId, "Existing"),
			).rejects.toThrow(MenuItemAlreadyExistsError);
		});

		it("should map P2002 error with variant target to InvalidVariantDataError", async () => {
			const p2002Error = new PrismaClientKnownRequestError(
				"Unique constraint failed",
				{
					code: "P2002",
					clientVersion: "6.0.0",
					meta: { target: ["menu_item_variants_single_default_idx"] },
				},
			);
			mockPrisma.menuItem.findFirst.mockRejectedValue(p2002Error);

			await expect(
				repository.findByNameAndRestaurantId(restaurantId, "Existing"),
			).rejects.toThrow(InvalidVariantDataError);
		});

		it("should map P2003 error to RestaurantNotFoundError by default", async () => {
			const p2003Error = new PrismaClientKnownRequestError(
				"Foreign key constraint",
				{
					code: "P2003",
					clientVersion: "6.0.0",
				},
			);
			mockPrisma.menuItem.findFirst.mockRejectedValue(p2003Error);

			await expect(
				repository.findByNameAndRestaurantId(restaurantId, "Burger"),
			).rejects.toThrow(RestaurantNotFoundError);
		});

		it("should map P2003 error for category foreign key to CategoryNotFoundError", async () => {
			const p2003CategoryError = new PrismaClientKnownRequestError(
				"Foreign key constraint failed on the field: categoryId",
				{
					code: "P2003",
					clientVersion: "6.0.0",
					meta: { field_name: "menu_items_category_id_fkey" },
				},
			);
			mockPrisma.menuItem.findFirst.mockRejectedValue(p2003CategoryError);

			await expect(
				repository.findByNameAndRestaurantId(restaurantId, "Burger"),
			).rejects.toThrow(CategoryNotFoundError);
		});

		it("should map P2003 error on addon to AddonNotFoundForRestaurantError", async () => {
			const p2003Error = new PrismaClientKnownRequestError(
				"Foreign key constraint failed on addon_id",
				{
					code: "P2003",
					clientVersion: "6.0.0",
					meta: { field_name: "addon_id" },
				},
			);
			mockPrisma.menuItem.findFirst.mockRejectedValue(p2003Error);

			await expect(
				repository.findByNameAndRestaurantId(restaurantId, "Item"),
			).rejects.toThrow(AddonNotFoundForRestaurantError);
		});

		it("should map P2025 error to MenuItemNotFoundError", async () => {
			const p2025Error = new PrismaClientKnownRequestError("Not found", {
				code: "P2025",
				clientVersion: "6.0.0",
			});
			mockPrisma.menuItem.findFirst.mockRejectedValue(p2025Error);

			await expect(
				repository.findByNameAndRestaurantId(restaurantId, "Burger"),
			).rejects.toThrow(MenuItemNotFoundError);
		});
	});

	describe("findByIdAndRestaurantId", () => {
		it("should return MenuItemDetailsAggregate when record exists", async () => {
			const mockFullRecord = {
				...rawMenuItem,
				category: {
					id: categoryId,
					name: "Burgers",
					description: "Juicy burgers",
					isActive: true,
				},
				images: [
					{
						id: "img-1",
						menuItemId: rawMenuItem.id,
						objectKey: "menu/burger.png",
						displayOrder: 0,
						createdAt: now,
					},
				],
				variants: [
					{
						id: "var-1",
						menuItemId: rawMenuItem.id,
						sku: "BURGER-REG",
						name: "Regular",
						price: new Prisma.Decimal(12.5),
						isDefault: true,
						createdAt: now,
						updatedAt: now,
					},
				],
				addons: [
					{
						id: "addon-link-1",
						menuItemId: rawMenuItem.id,
						addonId: "addon-1",
						priceOverride: new Prisma.Decimal(2.5),
						addon: {
							id: "addon-1",
							name: "Extra Cheddar",
							description: "Sharp cheddar",
							price: new Prisma.Decimal(2.0),
							imageKey: "addons/cheese.png",
							isAvailable: true,
							isDeleted: false,
						},
					},
				],
			};

			mockPrisma.menuItem.findFirst.mockResolvedValueOnce(mockFullRecord);

			const result = await repository.findByIdAndRestaurantId(
				rawMenuItem.id,
				restaurantId,
			);

			expect(mockPrisma.menuItem.findFirst).toHaveBeenCalledWith({
				where: {
					id: rawMenuItem.id,
					restaurantId,
				},
				include: {
					category: true,
					images: {
						orderBy: {
							displayOrder: "asc",
						},
					},
					variants: {
						orderBy: [
							{ isDefault: "desc" },
							{ price: "asc" },
							{ createdAt: "asc" },
						],
					},
					addons: {
						where: {
							addon: {
								isDeleted: false,
							},
						},
						include: {
							addon: true,
						},
						orderBy: {
							createdAt: "asc",
						},
					},
				},
			});

			expect(result).not.toBeNull();
			expect(result?.item.id).toBe(rawMenuItem.id);
			expect(result?.category?.name).toBe("Burgers");
			expect(result?.images).toHaveLength(1);
			expect(result?.variants).toHaveLength(1);
			expect(result?.addons).toHaveLength(1);
			expect(result?.addons[0].price).toBe(2.0);
			expect(result?.addons[0].priceOverride).toBe(2.5);
		});

		it("should return null when record does not exist", async () => {
			mockPrisma.menuItem.findFirst.mockResolvedValueOnce(null);

			const result = await repository.findByIdAndRestaurantId(
				"non-existent",
				restaurantId,
			);

			expect(result).toBeNull();
		});
	});
});
