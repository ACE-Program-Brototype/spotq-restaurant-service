import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { CreateMenuItemUseCase } from "@/application/use-cases/create-menu-item.use-case.ts";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import {
	AddonNotFoundForRestaurantError,
	CategoryNotFoundError,
	InvalidMenuItemDataError,
	InvalidVariantDataError,
	MenuItemAlreadyExistsError,
} from "@/domain/errors/menu-item.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";

describe("CreateMenuItemUseCase", () => {
	let useCase: CreateMenuItemUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockMenuItemRepo: jest.Mocked<IMenuItemRepository>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const categoryId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
	const addonId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";

	const mockRestaurant = Restaurant.reconstitute({
		id: restaurantId,
		name: "Arabian Palace",
		email: "owner@arabianpalace.com",
		phone: "9876543210",
		ownerName: "Ajex Joshy",
		address: "Calicut, Kerala",
		cuisineTypes: ["Arabian"],
		averageCost: 500,
		seatingCapacity: 50,
		status: "APPROVED",
		onboardingStatus: "COMPLETED",
		accountStatus: "ACTIVE",
		openTime: "10:00",
		closeTime: "23:00",
		openingDays: ["MONDAY"],
		isPureVeg: false,
		verifiedAt: new Date(),
		createdAt: new Date(),
		updatedAt: new Date(),
		profileImageKey: null,
	});

	const validDto = {
		restaurantId,
		categoryId,
		name: "Chicken Dum Biryani",
		description: "Delicious Dum Biryani",
		price: 320.0,
		preparationTime: 25,
		calories: 650,
		isVegetarian: false,
		isFeatured: true,
		isAvailable: true,
		images: [{ objectKey: "menu/biryani.png", displayOrder: 0 }],
		variants: [
			{
				sku: "BIRYANI-HALF",
				name: "Half Portion",
				price: 200.0,
				isDefault: false,
			},
			{
				sku: "BIRYANI-FULL",
				name: "Full Portion",
				price: 320.0,
				isDefault: true,
			},
		],
		addons: [{ addonId, priceOverride: 40.0 }],
	};

	let mockCategoryRepo: {
		findById: jest.Mock;
	};
	let mockAddonRepo: {
		findByIdsAndRestaurantId: jest.Mock;
	};
	const mockCategory = {
		id: categoryId,
		restaurantId,
		name: "Main Course",
	};

	beforeEach(() => {
		mockRestaurantRepo = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			existsByEmail: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			findApplicationsWithFilters: jest.fn(),
			findByIdWithDetails: jest.fn(),
			findCompletedDetailsById: jest.fn(),
			updateLastLogin: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockMenuItemRepo = {
			createWithDetails: jest.fn(),
			findById: jest.fn(),
			findByNameAndRestaurantId: jest.fn(),
		};

		mockCategoryRepo = {
			findById: jest.fn().mockResolvedValue(mockCategory),
		};

		mockAddonRepo = {
			findByIdsAndRestaurantId: jest
				.fn()
				.mockResolvedValue([{ id: addonId, restaurantId }]),
		};

		useCase = new CreateMenuItemUseCase(
			mockRestaurantRepo,
			mockMenuItemRepo,
			mockCategoryRepo as never,
			mockAddonRepo as never,
		);
	});

	it("should successfully create a menu item with variants and addons", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(mockRestaurant);
		mockMenuItemRepo.findByNameAndRestaurantId.mockResolvedValue(null);

		const createdItem = MenuItem.create({
			restaurantId,
			categoryId,
			name: validDto.name,
			description: validDto.description,
			price: validDto.price,
			preparationTime: validDto.preparationTime,
			calories: validDto.calories,
			isVegetarian: validDto.isVegetarian,
			isFeatured: validDto.isFeatured,
			isAvailable: validDto.isAvailable,
		});

		mockMenuItemRepo.createWithDetails.mockResolvedValue({
			item: createdItem,
			images: [
				{
					id: "img-1",
					menuItemId: createdItem.id,
					objectKey: "menu/biryani.png",
					displayOrder: 0,
					createdAt: new Date(),
				},
			],
			variants: [
				MenuItemVariant.reconstitute({
					id: "var-1",
					menuItemId: createdItem.id,
					sku: "BIRYANI-HALF",
					name: "Half Portion",
					price: 200.0,
					isDefault: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				}),
				MenuItemVariant.reconstitute({
					id: "var-2",
					menuItemId: createdItem.id,
					sku: "BIRYANI-FULL",
					name: "Full Portion",
					price: 320.0,
					isDefault: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				}),
			],
			addons: [
				{
					id: "junction-1",
					menuItemId: createdItem.id,
					addonId,
					name: "Extra Raita",
					price: 30.0,
					priceOverride: 40.0,
				},
			],
		});

		const result = await useCase.execute(validDto);

		expect(result).toBeDefined();
		expect(result.id).toBe(createdItem.id);
		expect(result.name).toBe("Chicken Dum Biryani");
		expect(result.variants).toHaveLength(2);
		expect(result.addons).toHaveLength(1);
		expect(result.images).toHaveLength(1);
		expect(mockMenuItemRepo.createWithDetails).toHaveBeenCalledTimes(1);
	});

	it("should default first variant when none is marked as default", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(mockRestaurant);
		mockMenuItemRepo.findByNameAndRestaurantId.mockResolvedValue(null);

		const createdItem = MenuItem.create({
			restaurantId,
			categoryId,
			name: "Paneer Tikka",
			price: 250.0,
		});

		mockMenuItemRepo.createWithDetails.mockResolvedValue({
			item: createdItem,
			images: [],
			variants: [
				MenuItemVariant.reconstitute({
					id: "var-1",
					menuItemId: createdItem.id,
					sku: null,
					name: "Regular",
					price: 250.0,
					isDefault: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				}),
			],
			addons: [],
		});

		const result = await useCase.execute({
			restaurantId,
			categoryId,
			name: "Paneer Tikka",
			price: 250.0,
			variants: [{ name: "Regular", price: 250.0 }],
		});

		expect(result.variants[0].isDefault).toBe(true);
		expect(mockMenuItemRepo.createWithDetails).toHaveBeenCalledWith(
			expect.objectContaining({
				variants: expect.arrayContaining([
					expect.objectContaining({ isDefault: true }),
				]),
			}),
		);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(null);

		await expect(useCase.execute(validDto)).rejects.toThrow(
			RestaurantNotFoundError,
		);
	});

	it("should throw CategoryNotFoundError when category does not belong to restaurant", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(mockRestaurant);
		mockCategoryRepo.findById.mockResolvedValue(null);

		await expect(useCase.execute(validDto)).rejects.toThrow(
			CategoryNotFoundError,
		);
	});

	it("should throw MenuItemAlreadyExistsError when dish name already exists in restaurant", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(mockRestaurant);
		mockMenuItemRepo.findByNameAndRestaurantId.mockResolvedValue(
			MenuItem.create({
				restaurantId,
				categoryId,
				name: validDto.name,
				price: 300,
			}),
		);

		await expect(useCase.execute(validDto)).rejects.toThrow(
			MenuItemAlreadyExistsError,
		);
	});

	it("should throw AddonNotFoundForRestaurantError when addons do not belong to restaurant", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(mockRestaurant);
		mockMenuItemRepo.findByNameAndRestaurantId.mockResolvedValue(null);
		mockAddonRepo.findByIdsAndRestaurantId.mockResolvedValue([]);

		await expect(useCase.execute(validDto)).rejects.toThrow(
			AddonNotFoundForRestaurantError,
		);
	});

	it("should throw InvalidVariantDataError when multiple variants are marked as default", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(mockRestaurant);
		mockMenuItemRepo.findByNameAndRestaurantId.mockResolvedValue(null);

		const dtoWithTwoDefaults = {
			...validDto,
			addons: [],
			variants: [
				{ name: "Var 1", price: 100, isDefault: true },
				{ name: "Var 2", price: 200, isDefault: true },
			],
		};

		await expect(useCase.execute(dtoWithTwoDefaults)).rejects.toThrow(
			InvalidVariantDataError,
		);
	});

	it("should throw InvalidMenuItemDataError when duplicate addons are provided", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(mockRestaurant);
		mockMenuItemRepo.findByNameAndRestaurantId.mockResolvedValue(null);

		const dtoWithDuplicateAddons = {
			...validDto,
			addons: [
				{ addonId, priceOverride: 10 },
				{ addonId, priceOverride: 20 },
			],
		};

		await expect(useCase.execute(dtoWithDuplicateAddons)).rejects.toThrow(
			InvalidMenuItemDataError,
		);
	});
});
