import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { GetMenuItemDetailsUseCase } from "@/application/use-cases/get-menu-item-details.use-case.ts";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import { MenuItemNotFoundError } from "@/domain/errors/menu-item.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { MenuItemDetailsAggregate } from "@/domain/repositories/menu-item.repository.interface.ts";

describe("GetMenuItemDetailsUseCase", () => {
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockMenuItemRepo: jest.Mocked<IMenuItemRepository>;
	let useCase: GetMenuItemDetailsUseCase;

	const restaurantId = "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const menuItemId = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22";

	beforeEach(() => {
		mockRestaurantRepo = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockMenuItemRepo = {
			findByIdAndRestaurantId: jest.fn(),
		} as unknown as jest.Mocked<IMenuItemRepository>;

		useCase = new GetMenuItemDetailsUseCase(
			mockRestaurantRepo,
			mockMenuItemRepo,
		);
	});

	const mockActiveRestaurant = {
		id: restaurantId,
		isBlocked: false,
		statusVO: {
			isActive: () => true,
			isApproved: () => true,
		},
	};

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		await expect(useCase.execute({ restaurantId, menuItemId })).rejects.toThrow(
			RestaurantNotFoundError,
		);

		expect(mockRestaurantRepo.findById).toHaveBeenCalledWith(restaurantId);
		expect(mockMenuItemRepo.findByIdAndRestaurantId).not.toHaveBeenCalled();
	});

	it("should throw RestaurantNotFoundError when restaurant is blocked", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: true,
			statusVO: {
				isActive: () => true,
				isApproved: () => true,
			},
		} as never);

		await expect(useCase.execute({ restaurantId, menuItemId })).rejects.toThrow(
			RestaurantNotFoundError,
		);
	});

	it("should throw RestaurantNotFoundError when restaurant is neither active nor approved", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
			statusVO: {
				isActive: () => false,
				isApproved: () => false,
			},
		} as never);

		await expect(useCase.execute({ restaurantId, menuItemId })).rejects.toThrow(
			RestaurantNotFoundError,
		);
	});

	it("should throw MenuItemNotFoundError when menu item is not found", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(mockActiveRestaurant as never);
		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce(null);

		await expect(useCase.execute({ restaurantId, menuItemId })).rejects.toThrow(
			MenuItemNotFoundError,
		);

		expect(mockMenuItemRepo.findByIdAndRestaurantId).toHaveBeenCalledWith(
			menuItemId,
			restaurantId,
		);
	});

	it("should throw MenuItemNotFoundError when category is inactive", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(mockActiveRestaurant as never);
		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: {} as never,
			category: {
				id: "cat-1",
				name: "Burgers",
				isActive: false,
			},
			images: [],
			variants: [],
			addons: [],
		} as never);

		await expect(useCase.execute({ restaurantId, menuItemId })).rejects.toThrow(
			MenuItemNotFoundError,
		);
	});

	it("should return menu item details with stored keys when found", async () => {
		const now = new Date();
		const domainItem = MenuItem.reconstitute({
			id: menuItemId,
			restaurantId,
			categoryId: "cat-1",
			name: "Gourmet Burger",
			description: "Juicy burger with cheese",
			price: 15.99,
			preparationTime: 15,
			calories: 550,
			isVegetarian: false,
			isFeatured: true,
			isAvailable: true,
			createdAt: now,
			updatedAt: now,
		});

		const domainVariant = MenuItemVariant.reconstitute({
			id: "var-1",
			menuItemId,
			sku: "BURGER-LG",
			name: "Large",
			price: 18.99,
			isDefault: false,
			createdAt: now,
			updatedAt: now,
		});

		const aggregate: MenuItemDetailsAggregate = {
			item: domainItem,
			category: {
				id: "cat-1",
				name: "Burgers",
				description: "Delicious burgers",
				isActive: true,
			},
			images: [
				{
					id: "img-1",
					menuItemId,
					objectKey: "menu/burger-large.png",
					displayOrder: 0,
					createdAt: now,
				},
			],
			variants: [domainVariant],
			addons: [
				{
					id: "junc-1",
					menuItemId,
					addonId: "addon-1",
					name: "Extra Bacon",
					description: "Crispy bacon strips",
					price: 3.5,
					priceOverride: 3.0,
					imageKey: "addons/bacon.png",
					isAvailable: true,
					isDeleted: false,
				},
			],
		};

		mockRestaurantRepo.findById.mockResolvedValueOnce(
			mockActiveRestaurant as never,
		);
		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce(aggregate);

		const result = await useCase.execute({ restaurantId, menuItemId });

		expect(result.id).toBe(menuItemId);
		expect(result.restaurantId).toBe(restaurantId);
		expect(result.name).toBe("Gourmet Burger");
		expect(result.categoryName).toBe("Burgers");
		expect(result.category).toEqual({
			id: "cat-1",
			name: "Burgers",
			description: "Delicious burgers",
		});
		expect(result.images).toEqual([
			{
				id: "img-1",
				objectKey: "menu/burger-large.png",
				displayOrder: 0,
			},
		]);
		expect(result.variants).toHaveLength(1);
		expect(result.variants[0].name).toBe("Large");
		expect(result.variants[0].isAvailable).toBe(true);
		expect(result.addons).toHaveLength(1);
		expect(result.addons[0].name).toBe("Extra Bacon");
		expect(result.addons[0].price).toBe(3.0);
		expect(result.addons[0].imageKey).toBe("addons/bacon.png");
	});
});
