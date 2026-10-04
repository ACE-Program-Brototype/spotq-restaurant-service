import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IAddonRepository } from "@/application/ports/repositories/addon.repository.port.ts";
import type { IMenuCategoryRepository } from "@/application/ports/repositories/menu-category.repository.port.ts";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { UpdateMenuItemUseCase } from "@/application/use-cases/update-menu-item.use-case.ts";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import {
	AddonNotFoundForRestaurantError,
	CategoryNotFoundError,
	InvalidMenuItemDataError,
	InvalidVariantDataError,
	MenuItemAlreadyExistsError,
	MenuItemNotFoundError,
} from "@/domain/errors/menu-item.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";

describe("UpdateMenuItemUseCase", () => {
	let useCase: UpdateMenuItemUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockMenuItemRepo: jest.Mocked<IMenuItemRepository>;
	let mockMenuCategoryRepo: jest.Mocked<IMenuCategoryRepository>;
	let mockAddonRepo: jest.Mocked<IAddonRepository>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const categoryId = "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44";
	const newCategoryId = "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66";
	const menuItemId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
	const addonId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";

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
			updateWithDetails: jest.fn(),
			updateAvailability: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			exists: jest.fn(),
		} as unknown as jest.Mocked<IMenuItemRepository>;

		mockMenuCategoryRepo = {
			findById: jest.fn(),
			findByIdAndRestaurantId: jest.fn(),
			findByRestaurantIdAndName: jest.fn(),
			findByRestaurantId: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			exists: jest.fn(),
		} as unknown as jest.Mocked<IMenuCategoryRepository>;

		mockAddonRepo = {
			findById: jest.fn(),
			findByIdsAndRestaurantId: jest.fn(),
			findByRestaurantIdAndName: jest.fn(),
			findByRestaurantId: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			exists: jest.fn(),
		} as unknown as jest.Mocked<IAddonRepository>;

		useCase = new UpdateMenuItemUseCase(
			mockRestaurantRepo,
			mockMenuItemRepo,
			mockMenuCategoryRepo,
			mockAddonRepo,
		);
	});

	it("should update menu item successfully with new variants and addons", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const existingItem = MenuItem.create({
			id: menuItemId,
			restaurantId,
			categoryId,
			name: "Original Biryani",
			description: "Old description",
			price: 250,
			preparationTime: 20,
			isVegetarian: false,
			isAvailable: true,
		});

		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: existingItem,
			category: { id: categoryId, name: "Rice", description: null, isActive: true },
			images: [{ id: "img-1", menuItemId, objectKey: "old-img.jpg", displayOrder: 0, createdAt: new Date() }],
			variants: [
				MenuItemVariant.create({
					id: "var-old-1",
					menuItemId,
					name: "Old Variant",
					price: 250,
					isDefault: true,
					isAvailable: true,
				}),
			],
			addons: [],
		});

		mockMenuItemRepo.findByNameAndRestaurantId.mockResolvedValueOnce(null);

		mockAddonRepo.findByIdsAndRestaurantId.mockResolvedValueOnce([
			{ id: addonId, restaurantId, name: "Extra Raita", price: 30 } as never,
		]);

		const updatedVariant = MenuItemVariant.create({
			id: "var-new-1",
			menuItemId,
			name: "Full Portion",
			price: 320,
			isDefault: true,
			isAvailable: true,
		});

		mockMenuItemRepo.updateWithDetails.mockResolvedValueOnce({
			item: existingItem,
			images: [{ id: "img-new-1", menuItemId, objectKey: "new-img.jpg", displayOrder: 0, createdAt: new Date() }],
			variants: [updatedVariant],
			addons: [{ id: "addon-link-1", menuItemId, addonId, name: "Extra Raita", price: 30, priceOverride: 25 }],
		});

		const result = await useCase.execute({
			restaurantId,
			menuItemId,
			name: "Special Dum Biryani",
			description: "Aromatic basmati rice with tender spiced chicken",
			images: [{ objectKey: "new-img.jpg", displayOrder: 0 }],
			variants: [
				{
					name: "Full Portion",
					price: 320,
					isDefault: true,
				},
			],
			addons: [{ addonId, priceOverride: 25 }],
		});

		expect(mockMenuItemRepo.updateWithDetails).toHaveBeenCalled();
		expect(result.name).toBe("Special Dum Biryani");
		expect(result.variants).toHaveLength(1);
		expect(result.variants[0].name).toBe("Full Portion");
		expect(result.addons).toHaveLength(1);
		expect(result.addons[0].priceOverride).toBe(25);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-restaurant",
				menuItemId,
				name: "New Name",
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("should throw MenuItemNotFoundError when menu item does not exist or is deleted", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId } as Restaurant);
		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId: "non-existent-item",
				name: "New Name",
			}),
		).rejects.toThrow(MenuItemNotFoundError);
	});

	it("should throw CategoryNotFoundError when updated category does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId } as Restaurant);

		const existingItem = MenuItem.create({
			id: menuItemId,
			restaurantId,
			categoryId,
			name: "Biryani",
			price: 250,
		});

		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: existingItem,
			category: null,
			images: [],
			variants: [],
			addons: [],
		});

		mockMenuCategoryRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId,
				categoryId: newCategoryId,
			}),
		).rejects.toThrow(CategoryNotFoundError);
	});

	it("should throw MenuItemAlreadyExistsError when another item with same name exists", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId } as Restaurant);

		const existingItem = MenuItem.create({
			id: menuItemId,
			restaurantId,
			categoryId,
			name: "Biryani",
			price: 250,
		});

		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: existingItem,
			category: null,
			images: [],
			variants: [],
			addons: [],
		});

		const duplicateItem = MenuItem.create({
			id: "another-item-id",
			restaurantId,
			categoryId,
			name: "Butter Chicken",
			price: 300,
		});

		mockMenuItemRepo.findByNameAndRestaurantId.mockResolvedValueOnce(duplicateItem);

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId,
				name: "Butter Chicken",
			}),
		).rejects.toThrow(MenuItemAlreadyExistsError);
	});

	it("should throw InvalidMenuItemDataError when duplicate addons are passed", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId } as Restaurant);

		const existingItem = MenuItem.create({
			id: menuItemId,
			restaurantId,
			categoryId,
			name: "Biryani",
			price: 250,
		});

		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: existingItem,
			category: null,
			images: [],
			variants: [],
			addons: [],
		});

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId,
				addons: [{ addonId }, { addonId }],
			}),
		).rejects.toThrow(InvalidMenuItemDataError);
	});

	it("should throw AddonNotFoundForRestaurantError when addon does not belong to restaurant", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId } as Restaurant);

		const existingItem = MenuItem.create({
			id: menuItemId,
			restaurantId,
			categoryId,
			name: "Biryani",
			price: 250,
		});

		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: existingItem,
			category: null,
			images: [],
			variants: [],
			addons: [],
		});

		mockAddonRepo.findByIdsAndRestaurantId.mockResolvedValueOnce([]);

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId,
				addons: [{ addonId }],
			}),
		).rejects.toThrow(AddonNotFoundForRestaurantError);
	});

	it("should throw InvalidVariantDataError when multiple variants are marked default", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId } as Restaurant);

		const existingItem = MenuItem.create({
			id: menuItemId,
			restaurantId,
			categoryId,
			name: "Biryani",
			price: 250,
		});

		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: existingItem,
			category: null,
			images: [],
			variants: [],
			addons: [],
		});

		await expect(
			useCase.execute({
				restaurantId,
				menuItemId,
				variants: [
					{ name: "Small", price: 100, isDefault: true },
					{ name: "Large", price: 200, isDefault: true },
				],
			}),
		).rejects.toThrow(InvalidVariantDataError);
	});
});
