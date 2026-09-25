import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { UpdateMenuCategoryUseCase } from "@/application/use-cases/update-menu-category.use-case.ts";
import { MenuCategory } from "@/domain/entities/menu-category.entity.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import {
	CategoryAlreadyExistsError,
	CategoryNotFoundError,
} from "@/domain/errors/menu-category.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IMenuCategoryRepository } from "@/domain/repositories/menu-category.repository.interface.ts";

describe("UpdateMenuCategoryUseCase", () => {
	let useCase: UpdateMenuCategoryUseCase;
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

		useCase = new UpdateMenuCategoryUseCase(
			mockRestaurantRepo,
			mockMenuCategoryRepo,
		);
	});

	it("should update category successfully with partial payload", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const existingCategory = MenuCategory.create({
			id: categoryId,
			restaurantId,
			name: "Main Course",
			description: "Old description",
			displayOrder: 1,
			isActive: true,
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(existingCategory);

		mockMenuCategoryRepo.updateCategory.mockImplementationOnce(
			async (entity: MenuCategory) => entity,
		);

		const result = await useCase.execute({
			restaurantId,
			categoryId,
			description: "Updated description",
			isActive: false,
		});

		expect(result).toBeDefined();
		expect(result.id).toBe(categoryId);
		expect(result.restaurantId).toBe(restaurantId);
		expect(result.name).toBe("Main Course");
		expect(result.description).toBe("Updated description");
		expect(result.displayOrder).toBe(1);
		expect(result.isActive).toBe(false);
		expect(mockMenuCategoryRepo.updateCategory).toHaveBeenCalledTimes(1);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-restaurant",
				categoryId,
				name: "New Name",
			}),
		).rejects.toThrow(RestaurantNotFoundError);

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
				name: "New Name",
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
			name: "Starters",
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(
			otherRestaurantCategory,
		);

		await expect(
			useCase.execute({
				restaurantId,
				categoryId,
				name: "New Name",
			}),
		).rejects.toThrow(CategoryNotFoundError);

		expect(mockMenuCategoryRepo.updateCategory).not.toHaveBeenCalled();
	});

	it("should throw CategoryAlreadyExistsError when new name conflicts with another category in the same restaurant", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const existingCategory = MenuCategory.create({
			id: categoryId,
			restaurantId,
			name: "Main Course",
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(existingCategory);

		const conflictingCategory = MenuCategory.create({
			id: "different-category-id",
			restaurantId,
			name: "Desserts",
		});
		mockMenuCategoryRepo.findByNameAndRestaurantId.mockResolvedValueOnce(
			conflictingCategory,
		);

		await expect(
			useCase.execute({
				restaurantId,
				categoryId,
				name: "Desserts",
			}),
		).rejects.toThrow(CategoryAlreadyExistsError);

		expect(mockMenuCategoryRepo.updateCategory).not.toHaveBeenCalled();
	});

	it("should allow updating name if it matches the current category's name", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const existingCategory = MenuCategory.create({
			id: categoryId,
			restaurantId,
			name: "Main Course",
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(existingCategory);

		mockMenuCategoryRepo.updateCategory.mockImplementationOnce(
			async (entity: MenuCategory) => entity,
		);

		const result = await useCase.execute({
			restaurantId,
			categoryId,
			name: "Main Course",
		});

		expect(result.name).toBe("Main Course");
		expect(mockMenuCategoryRepo.updateCategory).toHaveBeenCalledTimes(1);
	});

	it("should pass previousDisplayOrder to repository when displayOrder changes", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const existingCategory = MenuCategory.create({
			id: categoryId,
			restaurantId,
			name: "Main Course",
			displayOrder: 3,
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(existingCategory);

		mockMenuCategoryRepo.updateCategory.mockImplementationOnce(
			async (entity: MenuCategory) => entity,
		);

		await useCase.execute({
			restaurantId,
			categoryId,
			displayOrder: 1,
		});

		expect(mockMenuCategoryRepo.updateCategory).toHaveBeenCalledWith(
			expect.any(MenuCategory),
			3,
		);
	});
});
