import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { UpdateMenuCategoryStatusUseCase } from "@/application/use-cases/update-menu-category-status.use-case.ts";
import { MenuCategory } from "@/domain/entities/menu-category.entity.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { CategoryNotFoundError } from "@/domain/errors/menu-category.errors.ts";
import {
	RestaurantAccountBlockedError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors.ts";
import type { IMenuCategoryRepository } from "@/domain/repositories/menu-category.repository.interface.ts";

describe("UpdateMenuCategoryStatusUseCase", () => {
	let useCase: UpdateMenuCategoryStatusUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockMenuCategoryRepo: jest.Mocked<IMenuCategoryRepository>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const categoryId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

	beforeEach(() => {
		jest.clearAllMocks();

		mockRestaurantRepo = {
			findById: jest.fn(),
			exists: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
			findUnique: jest.fn(),
			find: jest.fn(),
			update: jest.fn(),
			findByEmail: jest.fn(),
			existsByEmail: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockMenuCategoryRepo = {
			findById: jest.fn(),
			findByNameAndRestaurantId: jest.fn(),
			getNextDisplayOrder: jest.fn(),
			create: jest.fn(),
			updateCategory: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
		} as unknown as jest.Mocked<IMenuCategoryRepository>;

		useCase = new UpdateMenuCategoryStatusUseCase(
			mockRestaurantRepo,
			mockMenuCategoryRepo,
		);
	});

	it("should deactivate category successfully when isActive is false", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const existingCategory = MenuCategory.create({
			id: categoryId,
			restaurantId,
			name: "Breakfast",
			isActive: true,
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(existingCategory);

		mockMenuCategoryRepo.updateCategory.mockImplementationOnce(
			async (entity: MenuCategory) => entity,
		);

		const result = await useCase.execute({
			restaurantId,
			categoryId,
			isActive: false,
		});

		expect(result).toBeDefined();
		expect(result.id).toBe(categoryId);
		expect(result.restaurantId).toBe(restaurantId);
		expect(result.name).toBe("Breakfast");
		expect(result.isActive).toBe(false);
		expect(mockMenuCategoryRepo.updateCategory).toHaveBeenCalledTimes(1);
	});

	it("should activate category successfully when isActive is true", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const existingCategory = MenuCategory.reconstitute({
			id: categoryId,
			restaurantId,
			name: "Seasonal Specials",
			description: null,
			displayOrder: 0,
			isActive: false,
			isDeleted: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(existingCategory);

		mockMenuCategoryRepo.updateCategory.mockImplementationOnce(
			async (entity: MenuCategory) => entity,
		);

		const result = await useCase.execute({
			restaurantId,
			categoryId,
			isActive: true,
		});

		expect(result).toBeDefined();
		expect(result.id).toBe(categoryId);
		expect(result.restaurantId).toBe(restaurantId);
		expect(result.name).toBe("Seasonal Specials");
		expect(result.isActive).toBe(true);
		expect(mockMenuCategoryRepo.updateCategory).toHaveBeenCalledTimes(1);
	});

	it("should be idempotent and not call repository updateCategory when category already has the requested status", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const existingCategory = MenuCategory.create({
			id: categoryId,
			restaurantId,
			name: "Breakfast",
			isActive: true,
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(existingCategory);

		const result = await useCase.execute({
			restaurantId,
			categoryId,
			isActive: true,
		});

		expect(result).toBeDefined();
		expect(result.id).toBe(categoryId);
		expect(result.isActive).toBe(true);
		expect(mockMenuCategoryRepo.updateCategory).not.toHaveBeenCalled();
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-restaurant",
				categoryId,
				isActive: false,
			}),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(mockMenuCategoryRepo.findById).not.toHaveBeenCalled();
		expect(mockMenuCategoryRepo.updateCategory).not.toHaveBeenCalled();
	});

	it("should throw RestaurantAccountBlockedError when restaurant is blocked", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: true,
		} as Restaurant);

		await expect(
			useCase.execute({
				restaurantId,
				categoryId,
				isActive: false,
			}),
		).rejects.toThrow(RestaurantAccountBlockedError);

		expect(mockMenuCategoryRepo.findById).not.toHaveBeenCalled();
		expect(mockMenuCategoryRepo.updateCategory).not.toHaveBeenCalled();
	});

	it("should throw CategoryNotFoundError when category does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId,
				categoryId: "non-existent-category",
				isActive: false,
			}),
		).rejects.toThrow(CategoryNotFoundError);

		expect(mockMenuCategoryRepo.updateCategory).not.toHaveBeenCalled();
	});

	it("should throw CategoryNotFoundError when category belongs to another restaurant (data isolation)", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const otherRestaurantCategory = MenuCategory.create({
			id: categoryId,
			restaurantId: "other-restaurant-id",
			name: "Breakfast",
			isActive: true,
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(
			otherRestaurantCategory,
		);

		await expect(
			useCase.execute({
				restaurantId,
				categoryId,
				isActive: false,
			}),
		).rejects.toThrow(CategoryNotFoundError);

		expect(mockMenuCategoryRepo.updateCategory).not.toHaveBeenCalled();
	});

	it("should throw CategoryNotFoundError when category is soft-deleted", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const softDeletedCategory = MenuCategory.reconstitute({
			id: categoryId,
			restaurantId,
			name: "Breakfast",
			description: null,
			displayOrder: 0,
			isActive: false,
			isDeleted: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(softDeletedCategory);

		await expect(
			useCase.execute({
				restaurantId,
				categoryId,
				isActive: true,
			}),
		).rejects.toThrow(CategoryNotFoundError);

		expect(mockMenuCategoryRepo.updateCategory).not.toHaveBeenCalled();
	});
});
