import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { DeleteMenuCategoryUseCase } from "@/application/use-cases/delete-menu-category.use-case.ts";
import { MenuCategory } from "@/domain/entities/menu-category.entity.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import {
	CategoryHasMenuItemsError,
	CategoryNotFoundError,
} from "@/domain/errors/menu-category.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IMenuCategoryRepository } from "@/domain/repositories/menu-category.repository.interface.ts";

describe("DeleteMenuCategoryUseCase", () => {
	let useCase: DeleteMenuCategoryUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockMenuCategoryRepo: jest.Mocked<IMenuCategoryRepository>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const otherRestaurantId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
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
			hasMenuItems: jest.fn(),
		} as unknown as jest.Mocked<IMenuCategoryRepository>;

		useCase = new DeleteMenuCategoryUseCase(
			mockRestaurantRepo,
			mockMenuCategoryRepo,
		);
	});

	it("should soft delete empty menu category successfully", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const existingCategory = MenuCategory.create({
			id: categoryId,
			restaurantId,
			name: "Summer Specials",
			displayOrder: 1,
			isActive: true,
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(existingCategory);
		mockMenuCategoryRepo.hasMenuItems.mockResolvedValueOnce(false);
		mockMenuCategoryRepo.updateCategory.mockImplementationOnce(
			async (entity: MenuCategory) => entity,
		);

		await useCase.execute({
			restaurantId,
			categoryId,
		});

		expect(mockRestaurantRepo.findById).toHaveBeenCalledWith(restaurantId);
		expect(mockMenuCategoryRepo.findById).toHaveBeenCalledWith(categoryId);
		expect(mockMenuCategoryRepo.hasMenuItems).toHaveBeenCalledWith(categoryId);
		expect(mockMenuCategoryRepo.updateCategory).toHaveBeenCalledTimes(1);
		expect(mockMenuCategoryRepo.updateCategory).toHaveBeenCalledWith(
			existingCategory,
		);
		expect(existingCategory.isDeleted).toBe(true);
		expect(existingCategory.isActive).toBe(false);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-restaurant",
				categoryId,
			}),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(mockMenuCategoryRepo.findById).not.toHaveBeenCalled();
		expect(mockMenuCategoryRepo.hasMenuItems).not.toHaveBeenCalled();
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
			}),
		).rejects.toThrow(CategoryNotFoundError);

		expect(mockMenuCategoryRepo.hasMenuItems).not.toHaveBeenCalled();
		expect(mockMenuCategoryRepo.updateCategory).not.toHaveBeenCalled();
	});

	it("should throw CategoryNotFoundError when category belongs to another restaurant (data isolation)", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const otherRestaurantCategory = MenuCategory.create({
			id: categoryId,
			restaurantId: otherRestaurantId,
			name: "Main Course",
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(
			otherRestaurantCategory,
		);

		await expect(
			useCase.execute({
				restaurantId,
				categoryId,
			}),
		).rejects.toThrow(CategoryNotFoundError);

		expect(mockMenuCategoryRepo.hasMenuItems).not.toHaveBeenCalled();
		expect(mockMenuCategoryRepo.updateCategory).not.toHaveBeenCalled();
	});

	it("should throw CategoryNotFoundError when category is already soft-deleted", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const deletedCategory = MenuCategory.reconstitute({
			id: categoryId,
			restaurantId,
			name: "Obsolete Category",
			description: null,
			displayOrder: 0,
			isActive: false,
			isDeleted: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(deletedCategory);

		await expect(
			useCase.execute({
				restaurantId,
				categoryId,
			}),
		).rejects.toThrow(CategoryNotFoundError);

		expect(mockMenuCategoryRepo.hasMenuItems).not.toHaveBeenCalled();
		expect(mockMenuCategoryRepo.updateCategory).not.toHaveBeenCalled();
	});

	it("should block deletion and throw CategoryHasMenuItemsError (409 Conflict) when category has menu items", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const categoryWithItems = MenuCategory.create({
			id: categoryId,
			restaurantId,
			name: "Beverages",
			displayOrder: 1,
			isActive: true,
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(categoryWithItems);
		mockMenuCategoryRepo.hasMenuItems.mockResolvedValueOnce(true);

		await expect(
			useCase.execute({
				restaurantId,
				categoryId,
			}),
		).rejects.toThrow(CategoryHasMenuItemsError);

		expect(mockMenuCategoryRepo.updateCategory).not.toHaveBeenCalled();
		expect(categoryWithItems.isDeleted).toBe(false);
	});
});
