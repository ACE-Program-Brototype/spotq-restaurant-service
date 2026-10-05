import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { UpdateMenuItemUseCase } from "@/application/use-cases/update-menu-item.use-case.ts";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import {
	InvalidVariantDataError,
	MenuItemNotFoundError,
} from "@/domain/errors/menu-item.errors.ts";
import {
	RestaurantAccountBlockedError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors.ts";
import type { IAddonRepository } from "@/domain/repositories/addon.repository.interface.ts";
import type { IMenuCategoryRepository } from "@/domain/repositories/menu-category.repository.interface.ts";

describe("UpdateMenuItemUseCase", () => {
	let useCase: UpdateMenuItemUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockMenuItemRepo: jest.Mocked<IMenuItemRepository>;
	let mockCategoryRepo: jest.Mocked<IMenuCategoryRepository>;
	let mockAddonRepo: jest.Mocked<IAddonRepository>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const menuItemId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
	const categoryId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";

	const mockActiveRestaurant = Restaurant.reconstitute({
		id: restaurantId,
		restaurantName: "Active Restaurant",
		email: "owner@active.com",
		phone: "9876543210",
		ownerName: "Owner",
		ownerEmail: "owner@active.com",
		status: "APPROVED",
		onboardingStatus: "COMPLETED",
		emailVerifiedAt: new Date(),
		isBlocked: false,
		blockReason: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	const mockBlockedRestaurant = Restaurant.reconstitute({
		id: restaurantId,
		restaurantName: "Blocked Restaurant",
		email: "owner@blocked.com",
		phone: "9876543210",
		ownerName: "Owner",
		ownerEmail: "owner@blocked.com",
		status: "APPROVED",
		onboardingStatus: "COMPLETED",
		emailVerifiedAt: new Date(),
		isBlocked: true,
		blockReason: "Violations",
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	const existingMenuItem = MenuItem.reconstitute({
		id: menuItemId,
		restaurantId,
		categoryId,
		name: "Chicken Biryani",
		description: "Delicious biryani",
		price: 300,
		preparationTime: 20,
		calories: 600,
		isVegetarian: false,
		isFeatured: false,
		isAvailable: true,
		isDeleted: false,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	const existingVariant = MenuItemVariant.reconstitute({
		id: "v0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99",
		menuItemId,
		sku: "BIRYANI-FULL",
		name: "Full",
		price: 300,
		isDefault: true,
		isAvailable: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	beforeEach(() => {
		mockRestaurantRepo = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findApplications: jest.fn(),
			countApplications: jest.fn(),
			findAllWithFilters: jest.fn(),
			countAllWithFilters: jest.fn(),
			save: jest.fn(),
			update: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockMenuItemRepo = {
			findById: jest.fn(),
			findByIdAndRestaurantId: jest.fn(),
			findByNameAndRestaurantId: jest.fn(),
			saveWithDetails: jest.fn(),
			updateWithDetails: jest.fn(),
			updateMenuItem: jest.fn(),
			updateMenuItemStatus: jest.fn(),
			findAllByRestaurantId: jest.fn(),
			findAllStaffByRestaurantId: jest.fn(),
		} as unknown as jest.Mocked<IMenuItemRepository>;

		mockCategoryRepo = {
			findById: jest.fn(),
			findByNameAndRestaurantId: jest.fn(),
			findAllByRestaurantId: jest.fn(),
			save: jest.fn(),
			update: jest.fn(),
		} as unknown as jest.Mocked<IMenuCategoryRepository>;

		mockAddonRepo = {
			findById: jest.fn(),
			findByIdsAndRestaurantId: jest.fn(),
			findByNameAndRestaurantId: jest.fn(),
			findAllByRestaurantId: jest.fn(),
			save: jest.fn(),
			update: jest.fn(),
		} as unknown as jest.Mocked<IAddonRepository>;

		useCase = new UpdateMenuItemUseCase(
			mockRestaurantRepo,
			mockMenuItemRepo,
			mockCategoryRepo,
			mockAddonRepo,
		);
	});

	it("should throw RestaurantNotFoundError when restaurant is not found", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId,
				name: "New Name",
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("should throw MenuItemNotFoundError when menu item is not found", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(mockActiveRestaurant);
		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId,
				name: "New Name",
			}),
		).rejects.toThrow(MenuItemNotFoundError);
	});

	it("should throw RestaurantAccountBlockedError when restaurant is blocked", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(mockBlockedRestaurant);

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId,
				name: "New Name",
			}),
		).rejects.toThrow(RestaurantAccountBlockedError);
	});

	it("should throw InvalidVariantDataError when empty variants array is provided", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(mockActiveRestaurant);
		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValue({
			item: existingMenuItem,
			images: [],
			variants: [existingVariant],
			addons: [],
		});

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId,
				variants: [],
			}),
		).rejects.toThrow(InvalidVariantDataError);
	});

	it("should update menu item successfully", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(mockActiveRestaurant);
		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValue({
			item: existingMenuItem,
			images: [],
			variants: [existingVariant],
			addons: [],
		});
		mockMenuItemRepo.findByNameAndRestaurantId.mockResolvedValue(null);
		mockMenuItemRepo.updateWithDetails.mockResolvedValue({
			item: existingMenuItem,
			images: [],
			variants: [existingVariant],
			addons: [],
		});

		const result = await useCase.execute({
			restaurantId,
			menuItemId,
			name: "Updated Chicken Biryani",
		});

		expect(result).toBeDefined();
		expect(mockMenuItemRepo.updateWithDetails).toHaveBeenCalled();
	});
});
