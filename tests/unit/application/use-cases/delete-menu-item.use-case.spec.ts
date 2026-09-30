import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { DeleteMenuItemUseCase } from "@/application/use-cases/delete-menu-item.use-case.ts";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { MenuItemNotFoundError } from "@/domain/errors/menu-item.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";

describe("DeleteMenuItemUseCase", () => {
	let useCase: DeleteMenuItemUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockMenuItemRepo: jest.Mocked<IMenuItemRepository>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const otherRestaurantId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
	const categoryId = "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44";
	const menuItemId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

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

		mockMenuItemRepo = {
			findById: jest.fn(),
			findByIdAndRestaurantId: jest.fn(),
			findByNameAndRestaurantId: jest.fn(),
			findManyWithFiltersAndStats: jest.fn(),
			getRestaurantMenuStats: jest.fn(),
			createWithDetails: jest.fn(),
			updateMenuItem: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			exists: jest.fn(),
		} as unknown as jest.Mocked<IMenuItemRepository>;

		useCase = new DeleteMenuItemUseCase(mockRestaurantRepo, mockMenuItemRepo);
	});

	it("should soft delete menuItem successfully", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const existingItem = MenuItem.create({
			id: menuItemId,
			restaurantId,
			categoryId,
			name: "Classic Cheeseburger",
			price: 15.99,
		});
		mockMenuItemRepo.findById.mockResolvedValueOnce(existingItem);
		mockMenuItemRepo.updateMenuItem.mockImplementationOnce(
			async (entity: MenuItem) => entity,
		);

		await useCase.execute({
			restaurantId,
			menuItemId,
		});

		expect(mockMenuItemRepo.findById).toHaveBeenCalledWith(menuItemId);
		expect(mockMenuItemRepo.updateMenuItem).toHaveBeenCalledTimes(1);
		expect(mockMenuItemRepo.updateMenuItem).toHaveBeenCalledWith(existingItem);
		expect(existingItem.isDeleted).toBe(true);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-restaurant",
				menuItemId,
			}),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(mockMenuItemRepo.findById).not.toHaveBeenCalled();
		expect(mockMenuItemRepo.updateMenuItem).not.toHaveBeenCalled();
	});

	it("should throw MenuItemNotFoundError when menuItem does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);
		mockMenuItemRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId: "non-existent-menu-item",
			}),
		).rejects.toThrow(MenuItemNotFoundError);

		expect(mockMenuItemRepo.updateMenuItem).not.toHaveBeenCalled();
	});

	it("should throw MenuItemNotFoundError when menuItem belongs to another restaurant", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const otherRestaurantItem = MenuItem.create({
			id: menuItemId,
			restaurantId: otherRestaurantId,
			categoryId,
			name: "Other Restaurant Burger",
			price: 12.5,
		});
		mockMenuItemRepo.findById.mockResolvedValueOnce(otherRestaurantItem);

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId,
			}),
		).rejects.toThrow(MenuItemNotFoundError);

		expect(mockMenuItemRepo.updateMenuItem).not.toHaveBeenCalled();
	});

	it("should throw MenuItemNotFoundError when menuItem is already deleted", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const deletedItem = MenuItem.reconstitute({
			id: menuItemId,
			restaurantId,
			categoryId,
			name: "Deleted Burger",
			description: null,
			price: 10.0,
			preparationTime: null,
			calories: null,
			isVegetarian: false,
			isFeatured: false,
			isAvailable: false,
			isDeleted: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockMenuItemRepo.findById.mockResolvedValueOnce(deletedItem);

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId,
			}),
		).rejects.toThrow(MenuItemNotFoundError);

		expect(mockMenuItemRepo.updateMenuItem).not.toHaveBeenCalled();
	});
});
