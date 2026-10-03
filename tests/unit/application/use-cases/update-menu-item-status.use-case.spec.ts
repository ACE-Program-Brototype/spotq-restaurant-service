import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { UpdateMenuItemStatusUseCase } from "@/application/use-cases/update-menu-item-status.use-case.ts";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { MenuItemNotFoundError } from "@/domain/errors/menu-item.errors.ts";
import {
	RestaurantAccountBlockedError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors.ts";

describe("UpdateMenuItemStatusUseCase", () => {
	let useCase: UpdateMenuItemStatusUseCase;
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
			updateAvailability: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			exists: jest.fn(),
		} as unknown as jest.Mocked<IMenuItemRepository>;

		useCase = new UpdateMenuItemStatusUseCase(
			mockRestaurantRepo,
			mockMenuItemRepo,
		);
	});

	it("should update menuItem and variants availability to false successfully", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as Restaurant);

		const existingItem = MenuItem.create({
			id: menuItemId,
			restaurantId,
			categoryId,
			name: "Classic Cheeseburger",
			price: 15.99,
			isAvailable: true,
		});
		mockMenuItemRepo.findById.mockResolvedValueOnce(existingItem);
		mockMenuItemRepo.updateAvailability.mockImplementationOnce(
			async (entity: MenuItem) => entity,
		);

		const updatedDomainItem = MenuItem.reconstitute({
			id: menuItemId,
			restaurantId,
			categoryId,
			name: "Classic Cheeseburger",
			description: null,
			price: 15.99,
			preparationTime: null,
			calories: null,
			isVegetarian: false,
			isFeatured: false,
			isAvailable: false,
			isDeleted: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		const updatedVariant = MenuItemVariant.reconstitute({
			id: "var-1",
			menuItemId,
			sku: "BURGER-1",
			name: "Regular",
			price: 15.99,
			isDefault: true,
			isAvailable: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: updatedDomainItem,
			category: {
				id: categoryId,
				name: "Burgers",
				description: null,
				isActive: true,
			},
			images: [],
			variants: [updatedVariant],
			addons: [],
		});

		const result = await useCase.execute({
			restaurantId,
			menuItemId,
			isAvailable: false,
		});

		expect(mockMenuItemRepo.findById).toHaveBeenCalledWith(menuItemId);
		expect(mockMenuItemRepo.updateAvailability).toHaveBeenCalledWith(
			existingItem,
		);
		expect(existingItem.isAvailable).toBe(false);
		expect(result.id).toBe(menuItemId);
		expect(result.isAvailable).toBe(false);
		expect(result.variants[0].isAvailable).toBe(false);
	});

	it("should update menuItem availability to true successfully", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as Restaurant);

		const existingItem = MenuItem.create({
			id: menuItemId,
			restaurantId,
			categoryId,
			name: "Classic Cheeseburger",
			price: 15.99,
			isAvailable: false,
		});
		mockMenuItemRepo.findById.mockResolvedValueOnce(existingItem);
		mockMenuItemRepo.updateAvailability.mockImplementationOnce(
			async (entity: MenuItem) => entity,
		);

		const updatedDomainItem = MenuItem.reconstitute({
			id: menuItemId,
			restaurantId,
			categoryId,
			name: "Classic Cheeseburger",
			description: null,
			price: 15.99,
			preparationTime: null,
			calories: null,
			isVegetarian: false,
			isFeatured: false,
			isAvailable: true,
			isDeleted: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: updatedDomainItem,
			category: null,
			images: [],
			variants: [],
			addons: [],
		});

		const result = await useCase.execute({
			restaurantId,
			menuItemId,
			isAvailable: true,
		});

		expect(mockMenuItemRepo.updateAvailability).toHaveBeenCalledWith(
			existingItem,
		);
		expect(existingItem.isAvailable).toBe(true);
		expect(result.isAvailable).toBe(true);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-restaurant",
				menuItemId,
				isAvailable: false,
			}),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(mockMenuItemRepo.findById).not.toHaveBeenCalled();
		expect(mockMenuItemRepo.updateAvailability).not.toHaveBeenCalled();
	});

	it("should throw RestaurantAccountBlockedError when restaurant is blocked", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: true,
		} as Restaurant);

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId,
				isAvailable: false,
			}),
		).rejects.toThrow(RestaurantAccountBlockedError);

		expect(mockMenuItemRepo.findById).not.toHaveBeenCalled();
		expect(mockMenuItemRepo.updateAvailability).not.toHaveBeenCalled();
	});

	it("should throw MenuItemNotFoundError when menuItem does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as Restaurant);
		mockMenuItemRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId: "non-existent-menu-item",
				isAvailable: false,
			}),
		).rejects.toThrow(MenuItemNotFoundError);

		expect(mockMenuItemRepo.updateAvailability).not.toHaveBeenCalled();
	});

	it("should throw MenuItemNotFoundError when menuItem belongs to another restaurant", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
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
				isAvailable: false,
			}),
		).rejects.toThrow(MenuItemNotFoundError);

		expect(mockMenuItemRepo.updateAvailability).not.toHaveBeenCalled();
	});

	it("should throw MenuItemNotFoundError when menuItem is deleted", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
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
				isAvailable: false,
			}),
		).rejects.toThrow(MenuItemNotFoundError);

		expect(mockMenuItemRepo.updateAvailability).not.toHaveBeenCalled();
	});

	it("should throw MenuItemNotFoundError when updated aggregate is not found", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as Restaurant);

		const existingItem = MenuItem.create({
			id: menuItemId,
			restaurantId,
			categoryId,
			name: "Classic Cheeseburger",
			price: 15.99,
			isAvailable: true,
		});
		mockMenuItemRepo.findById.mockResolvedValueOnce(existingItem);
		mockMenuItemRepo.updateAvailability.mockResolvedValueOnce(existingItem);
		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId,
				isAvailable: false,
			}),
		).rejects.toThrow(MenuItemNotFoundError);
	});
});
