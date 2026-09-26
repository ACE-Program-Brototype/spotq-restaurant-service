import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Prisma, type PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import { MenuItemAlreadyExistsError } from "@/domain/errors/menu-item.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import { PrismaMenuItemRepository } from "@/infrastructure/database/repositories/prisma-menu-item.repository.ts";

describe("PrismaMenuItemRepository", () => {
	let mockPrisma: {
		menuItem: {
			create: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			findUnique: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			findFirst: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
		};
		menuCategory: {
			findFirst: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
		};
		addon: {
			count: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
		};
		$transaction: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
	};
	let repository: PrismaMenuItemRepository;

	const now = new Date();
	const rawMenuItem = {
		id: "item-123",
		restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		categoryId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
		name: "Chicken Dum Biryani",
		description: "Delicious Dum Biryani",
		price: new Prisma.Decimal(320.0),
		preparationTime: 25,
		calories: 650,
		isVegetarian: false,
		isFeatured: true,
		isAvailable: true,
		createdAt: now,
		updatedAt: now,
	};

	beforeEach(() => {
		mockPrisma = {
			menuItem: {
				create: jest.fn(),
				findUnique: jest.fn(),
				findFirst: jest.fn(),
			},
			menuCategory: {
				findFirst: jest.fn(),
			},
			addon: {
				count: jest.fn(),
			},
			$transaction: jest.fn(),
		};

		repository = new PrismaMenuItemRepository(
			mockPrisma as unknown as PrismaClient,
		);
	});

	it("should find menu item by name and restaurantId", async () => {
		mockPrisma.menuItem.findFirst.mockResolvedValue(rawMenuItem);

		const result = await repository.findByNameAndRestaurantId(
			"Chicken Dum Biryani",
			rawMenuItem.restaurantId,
		);

		expect(result).toBeDefined();
		expect(result?.name).toBe("Chicken Dum Biryani");
		expect(result?.price).toBe(320.0);
	});

	it("should find menu item by id", async () => {
		mockPrisma.menuItem.findUnique.mockResolvedValue(rawMenuItem);

		const result = await repository.findById("item-123");

		expect(result).toBeDefined();
		expect(result?.id).toBe("item-123");
	});

	it("should return null if menu item not found", async () => {
		mockPrisma.menuItem.findUnique.mockResolvedValue(null);

		const result = await repository.findById("non-existent");
		expect(result).toBeNull();
	});

	it("should verify category belongs to restaurant", async () => {
		mockPrisma.menuCategory.findFirst.mockResolvedValue({ id: "cat-1" });

		const result = await repository.verifyCategoryBelongsToRestaurant(
			"cat-1",
			rawMenuItem.restaurantId,
		);

		expect(result).toBe(true);
	});

	it("should verify addons belong to restaurant", async () => {
		mockPrisma.addon.count.mockResolvedValue(2);

		const result = await repository.verifyAddonsBelongToRestaurant(
			["addon-1", "addon-2"],
			rawMenuItem.restaurantId,
		);

		expect(result).toBe(true);
	});

	it("should return false if some addons do not belong to restaurant", async () => {
		mockPrisma.addon.count.mockResolvedValue(1);

		const result = await repository.verifyAddonsBelongToRestaurant(
			["addon-1", "addon-2"],
			rawMenuItem.restaurantId,
		);

		expect(result).toBe(false);
	});

	it("should create menu item with details inside transaction", async () => {
		const mockTx = {
			menuItem: {
				create: jest.fn().mockResolvedValue(rawMenuItem),
			},
			menuItemImage: {
				create: jest.fn().mockResolvedValue({
					id: "img-1",
					menuItemId: "item-123",
					objectKey: "menu/biryani.png",
					displayOrder: 0,
					createdAt: now,
				}),
			},
			menuItemVariant: {
				create: jest.fn().mockResolvedValue({
					id: "var-1",
					menuItemId: "item-123",
					sku: "BIRYANI-FULL",
					name: "Full Portion",
					price: new Prisma.Decimal(320.0),
					isDefault: true,
					createdAt: now,
					updatedAt: now,
				}),
			},
			menuItemAddon: {
				create: jest.fn().mockResolvedValue({
					id: "junc-1",
					menuItemId: "item-123",
					addonId: "addon-1",
					priceOverride: new Prisma.Decimal(40.0),
					displayOrder: 0,
				}),
			},
			addon: {
				findUnique: jest.fn().mockResolvedValue({
					id: "addon-1",
					name: "Extra Raita",
					price: new Prisma.Decimal(30.0),
				}),
				findMany: jest.fn().mockResolvedValue([
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
			name: "Full Portion",
			price: 320.0,
			isDefault: true,
		});

		const aggregate = await repository.createWithDetails({
			menuItem: domainItem,
			images: [{ objectKey: "menu/biryani.png", displayOrder: 0 }],
			variants: [domainVariant],
			addons: [{ addonId: "addon-1", priceOverride: 40.0, displayOrder: 0 }],
		});

		expect(aggregate).toBeDefined();
		expect(aggregate.item.id).toBe("item-123");
		expect(aggregate.images).toHaveLength(1);
		expect(aggregate.variants).toHaveLength(1);
		expect(aggregate.addons).toHaveLength(1);
		expect(aggregate.addons[0].name).toBe("Extra Raita");
	});

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
			repository.findByNameAndRestaurantId(
				"Existing",
				rawMenuItem.restaurantId,
			),
		).rejects.toThrow(MenuItemAlreadyExistsError);
	});

	it("should map P2003 error to RestaurantNotFoundError", async () => {
		const p2003Error = new PrismaClientKnownRequestError(
			"Foreign key constraint failed",
			{
				code: "P2003",
				clientVersion: "6.0.0",
			},
		);
		mockPrisma.menuItem.findFirst.mockRejectedValue(p2003Error);

		await expect(
			repository.findByNameAndRestaurantId("Item", "non-existent-restaurant"),
		).rejects.toThrow(RestaurantNotFoundError);
	});
});
