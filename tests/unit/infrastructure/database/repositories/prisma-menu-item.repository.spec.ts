import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Prisma, type PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemNotFoundError } from "@/domain/errors/menu-item.errors.ts";
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
			count: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
		};
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
				count: jest.fn(),
			},
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

	describe("getRestaurantMenuStats", () => {
		it("should return restaurant menu KPI counts", async () => {
			mockPrisma.menuCategory.count.mockResolvedValue(4);
			mockPrisma.menuItem.count
				.mockResolvedValueOnce(12) // total
				.mockResolvedValueOnce(10) // available
				.mockResolvedValueOnce(2); // out of stock

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
				.mockResolvedValueOnce(1) // filtered count
				.mockResolvedValueOnce(10) // total stats count
				.mockResolvedValueOnce(8) // available stats count
				.mockResolvedValueOnce(2); // out of stock stats count
			mockPrisma.menuCategory.count.mockResolvedValue(3); // total categories

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
		it("should translate P2003 error to RestaurantNotFoundError", async () => {
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

		it("should translate P2025 error to MenuItemNotFoundError", async () => {
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
});
