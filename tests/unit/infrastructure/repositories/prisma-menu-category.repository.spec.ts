import type { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { MenuCategory } from "@/domain/entities/menu-category.entity.ts";
import { CategoryAlreadyExistsError } from "@/domain/errors/menu-category.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import { PrismaMenuCategoryRepository } from "@/infrastructure/database/repositories/prisma-menu-category.repository.ts";

describe("PrismaMenuCategoryRepository", () => {
	let mockPrisma: {
		$transaction: jest.Mock;
		menuCategory: {
			findFirst: jest.Mock;
			create: jest.Mock;
			updateMany: jest.Mock;
			findUnique: jest.Mock;
			count: jest.Mock;
			upsert: jest.Mock;
			delete: jest.Mock;
		};
	};
	let repository: PrismaMenuCategoryRepository;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

	beforeEach(() => {
		mockPrisma = {
			// biome-ignore lint/suspicious/noExplicitAny: Mock transaction callback
			$transaction: jest.fn(async (cb: (tx: any) => Promise<any>) =>
				cb(mockPrisma),
			),
			menuCategory: {
				findFirst: jest.fn(),
				create: jest.fn(),
				updateMany: jest.fn().mockResolvedValue({ count: 0 }),
				findUnique: jest.fn(),
				count: jest.fn(),
				upsert: jest.fn(),
				delete: jest.fn(),
			},
		};
		repository = new PrismaMenuCategoryRepository(
			mockPrisma as unknown as PrismaClient,
		);
		jest.clearAllMocks();
	});

	it("should return domain entity when category is found by name and restaurantId", async () => {
		const rawRecord = {
			id: "cat-1",
			restaurantId,
			name: "Beverages",
			description: "Cold drinks",
			displayOrder: 1,
			isActive: true,
			createdAt: new Date("2026-09-23T10:00:00Z"),
			updatedAt: new Date("2026-09-23T10:00:00Z"),
		};

		mockPrisma.menuCategory.findFirst.mockResolvedValueOnce(rawRecord);

		const result = await repository.findByNameAndRestaurantId(
			restaurantId,
			"Beverages",
		);

		expect(result).toBeInstanceOf(MenuCategory);
		expect(result?.id).toBe("cat-1");
		expect(result?.name).toBe("Beverages");
		expect(mockPrisma.menuCategory.findFirst).toHaveBeenCalledWith({
			where: {
				restaurantId,
				name: {
					equals: "Beverages",
					mode: "insensitive",
				},
			},
		});
	});

	it("should return null when category is not found by name and restaurantId", async () => {
		mockPrisma.menuCategory.findFirst.mockResolvedValueOnce(null);

		const result = await repository.findByNameAndRestaurantId(
			restaurantId,
			"NonExistent",
		);

		expect(result).toBeNull();
	});

	it("should calculate next display order as max + 1 when categories exist", async () => {
		mockPrisma.menuCategory.findFirst.mockResolvedValueOnce({
			displayOrder: 4,
		});

		const nextOrder = await repository.getNextDisplayOrder(restaurantId);

		expect(nextOrder).toBe(5);
		expect(mockPrisma.menuCategory.findFirst).toHaveBeenCalledWith({
			where: { restaurantId },
			orderBy: { displayOrder: "desc" },
			select: { displayOrder: true },
		});
	});

	it("should return 0 as next display order when no categories exist", async () => {
		mockPrisma.menuCategory.findFirst.mockResolvedValueOnce(null);

		const nextOrder = await repository.getNextDisplayOrder(restaurantId);

		expect(nextOrder).toBe(0);
	});

	it("should create a category and return domain entity", async () => {
		const category = MenuCategory.create({
			restaurantId,
			name: "Main Course",
			description: "Main dishes",
			displayOrder: 2,
		});

		const rawRecord = {
			id: category.id,
			restaurantId: category.restaurantId,
			name: category.name,
			description: category.description,
			displayOrder: category.displayOrder,
			isActive: category.isActive,
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
		};

		mockPrisma.menuCategory.create.mockResolvedValueOnce(rawRecord);

		const created = await repository.create(category);

		expect(created).toBeInstanceOf(MenuCategory);
		expect(created.id).toBe(category.id);
		expect(created.name).toBe("Main Course");
	});

	it("should shift existing display orders with increment 1 when creating category", async () => {
		const category = MenuCategory.create({
			restaurantId,
			name: "Appetizers",
			displayOrder: 2,
		});

		mockPrisma.menuCategory.updateMany.mockResolvedValueOnce({ count: 3 });
		mockPrisma.menuCategory.create.mockResolvedValueOnce({
			id: category.id,
			restaurantId: category.restaurantId,
			name: category.name,
			description: category.description,
			displayOrder: category.displayOrder,
			isActive: category.isActive,
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
		});

		const created = await repository.create(category);

		expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
		expect(mockPrisma.menuCategory.updateMany).toHaveBeenCalledWith({
			where: {
				restaurantId,
				displayOrder: {
					gte: 2,
				},
			},
			data: {
				displayOrder: {
					increment: 1,
				},
			},
		});
		expect(mockPrisma.menuCategory.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				displayOrder: 2,
			}),
		});
		expect(created.displayOrder).toBe(2);
	});

	it("should translate P2002 error to CategoryAlreadyExistsError", async () => {
		const category = MenuCategory.create({
			restaurantId,
			name: "Starters",
		});

		const prismaError = new PrismaClientKnownRequestError(
			"Unique constraint failed",
			{
				code: "P2002",
				clientVersion: "6.19.3",
			},
		);

		mockPrisma.menuCategory.create.mockRejectedValueOnce(prismaError);

		await expect(repository.create(category)).rejects.toThrow(
			CategoryAlreadyExistsError,
		);
	});

	it("should translate P2003 error to RestaurantNotFoundError", async () => {
		const category = MenuCategory.create({
			restaurantId: "non-existent-restaurant",
			name: "Starters",
		});

		const prismaError = new PrismaClientKnownRequestError(
			"Foreign key constraint failed",
			{
				code: "P2003",
				clientVersion: "6.19.3",
			},
		);

		mockPrisma.menuCategory.create.mockRejectedValueOnce(prismaError);

		await expect(repository.create(category)).rejects.toThrow(
			RestaurantNotFoundError,
		);
	});
});
