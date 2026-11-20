import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import { GetInternalMenuItemDetailsUseCase } from "@/application/use-cases/internal/get-internal-menu-item-details.use-case.ts";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { MenuItemNotFoundError } from "@/domain/errors/menu-item.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";

describe("GetInternalMenuItemDetailsUseCase", () => {
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let menuItemRepository: jest.Mocked<IMenuItemRepository>;
	let useCase: GetInternalMenuItemDetailsUseCase;

	const now = new Date();
	const activeRestaurant = Restaurant.reconstitute({
		id: "rest-123",
		restaurantName: "Spice Kitchen",
		email: "test@example.com",
		phone: "+1234567890",
		ownerName: "Owner",
		ownerEmail: "owner@example.com",
		status: "ACTIVE",
		onboardingStatus: "COMPLETED",
		emailVerifiedAt: now,
		rejectionReason: null,
		lastLoginAt: now,
		isSubscriptionActive: true,
		subscriptionPlanCode: "PREMIUM",
		subscriptionEndsAt: new Date(now.getTime() + 1000000),
		isBlocked: false,
		blockReason: null,
		createdAt: now,
		updatedAt: now,
	});

	beforeEach(() => {
		restaurantRepository = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		menuItemRepository = {
			findByIdAndRestaurantId: jest.fn(),
		} as unknown as jest.Mocked<IMenuItemRepository>;

		useCase = new GetInternalMenuItemDetailsUseCase(
			restaurantRepository,
			menuItemRepository,
		);
	});

	it("should throw RestaurantNotFoundError if restaurant does not exist", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: "rest-123",
				menuItemId: "item-123",
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("should throw RestaurantNotFoundError if restaurant is blocked", async () => {
		const blocked = Restaurant.reconstitute({
			id: "rest-123",
			restaurantName: "Spice Kitchen",
			email: "test@example.com",
			phone: "+1234567890",
			ownerName: "Owner",
			ownerEmail: "owner@example.com",
			status: "ACTIVE",
			onboardingStatus: "COMPLETED",
			emailVerifiedAt: now,
			rejectionReason: null,
			lastLoginAt: now,
			isSubscriptionActive: true,
			subscriptionPlanCode: "PREMIUM",
			subscriptionEndsAt: new Date(now.getTime() + 1000000),
			isBlocked: true,
			blockReason: "Violation",
			createdAt: now,
			updatedAt: now,
		});
		restaurantRepository.findById.mockResolvedValue(blocked);

		await expect(
			useCase.execute({
				restaurantId: "rest-123",
				menuItemId: "item-123",
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("should throw RestaurantNotFoundError if restaurant is not active", async () => {
		const pending = Restaurant.reconstitute({
			id: "rest-123",
			restaurantName: "Spice Kitchen",
			email: "test@example.com",
			phone: "+1234567890",
			ownerName: "Owner",
			ownerEmail: "owner@example.com",
			status: "PENDING",
			onboardingStatus: "COMPLETED",
			emailVerifiedAt: now,
			rejectionReason: null,
			lastLoginAt: now,
			isSubscriptionActive: true,
			subscriptionPlanCode: "PREMIUM",
			subscriptionEndsAt: new Date(now.getTime() + 1000000),
			isBlocked: false,
			blockReason: null,
			createdAt: now,
			updatedAt: now,
		});
		restaurantRepository.findById.mockResolvedValue(pending);

		await expect(
			useCase.execute({
				restaurantId: "rest-123",
				menuItemId: "item-123",
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("should throw RestaurantNotFoundError if restaurant subscription is inactive", async () => {
		const inactiveSub = Restaurant.reconstitute({
			id: "rest-123",
			restaurantName: "Spice Kitchen",
			email: "test@example.com",
			phone: "+1234567890",
			ownerName: "Owner",
			ownerEmail: "owner@example.com",
			status: "ACTIVE",
			onboardingStatus: "COMPLETED",
			emailVerifiedAt: now,
			rejectionReason: null,
			lastLoginAt: now,
			isSubscriptionActive: false,
			subscriptionPlanCode: null,
			subscriptionEndsAt: null,
			isBlocked: false,
			blockReason: null,
			createdAt: now,
			updatedAt: now,
		});
		restaurantRepository.findById.mockResolvedValue(inactiveSub);

		await expect(
			useCase.execute({
				restaurantId: "rest-123",
				menuItemId: "item-123",
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("should throw MenuItemNotFoundError if menu item is not found", async () => {
		restaurantRepository.findById.mockResolvedValue(activeRestaurant);
		menuItemRepository.findByIdAndRestaurantId.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: "rest-123",
				menuItemId: "item-123",
			}),
		).rejects.toThrow(MenuItemNotFoundError);
	});

	it("should throw MenuItemNotFoundError if category is inactive", async () => {
		restaurantRepository.findById.mockResolvedValue(activeRestaurant);

		const item = MenuItem.reconstitute({
			id: "item-123",
			restaurantId: "rest-123",
			categoryId: "cat-inactive",
			name: "Biryani",
			description: "Tasty",
			price: 250,
			preparationTime: 20,
			calories: 500,
			isVegetarian: false,
			isFeatured: true,
			isAvailable: true,
			createdAt: now,
			updatedAt: now,
		});

		menuItemRepository.findByIdAndRestaurantId.mockResolvedValue({
			item,
			category: {
				id: "cat-inactive",
				name: "Seasonal",
				description: "Inactive category",
				isActive: false,
			},
			images: [],
			variants: [],
			addons: [],
		});

		await expect(
			useCase.execute({
				restaurantId: "rest-123",
				menuItemId: "item-123",
			}),
		).rejects.toThrow(MenuItemNotFoundError);
	});

	it("should return item details even when item itself is marked unavailable", async () => {
		restaurantRepository.findById.mockResolvedValue(activeRestaurant);

		const item = MenuItem.reconstitute({
			id: "item-123",
			restaurantId: "rest-123",
			categoryId: "cat-1",
			name: "Biryani",
			description: "Tasty",
			price: 250,
			preparationTime: 20,
			calories: 500,
			isVegetarian: false,
			isFeatured: true,
			isAvailable: false,
			createdAt: now,
			updatedAt: now,
		});

		const variant = MenuItemVariant.reconstitute({
			id: "var-1",
			menuItemId: "item-123",
			sku: "SKU-1",
			name: "Full",
			price: 300,
			isDefault: true,
			isAvailable: true,
			createdAt: now,
			updatedAt: now,
		});

		menuItemRepository.findByIdAndRestaurantId.mockResolvedValue({
			item,
			category: {
				id: "cat-1",
				name: "Main Course",
				description: "Delicious mains",
				isActive: true,
			},
			images: [
				{
					id: "img-1",
					menuItemId: "item-123",
					objectKey: "key-1",
					displayOrder: 0,
					createdAt: now,
				},
			],
			variants: [variant],
			addons: [
				{
					id: "addon-link-1",
					menuItemId: "item-123",
					addonId: "addon-1",
					name: "Raita",
					description: "Cool raita",
					price: 30,
					priceOverride: 25,
					imageKey: null,
					isAvailable: true,
					isDeleted: false,
				},
			],
		});

		const result = await useCase.execute({
			restaurantId: "rest-123",
			menuItemId: "item-123",
		});

		expect(result).toBeDefined();
		expect(result.id).toBe("item-123");
		expect(result.name).toBe("Biryani");
		expect(result.isAvailable).toBe(false);
		expect(result.variants[0].isAvailable).toBe(false);
		expect(result.addons[0].price).toBe(25);
		expect(result.addons[0].priceOverride).toBe(25);
	});

	it("should accurately return available item details with variants and addons", async () => {
		restaurantRepository.findById.mockResolvedValue(activeRestaurant);

		const item = MenuItem.reconstitute({
			id: "item-123",
			restaurantId: "rest-123",
			categoryId: "cat-1",
			name: "Biryani",
			description: "Tasty",
			price: 250,
			preparationTime: 20,
			calories: 500,
			isVegetarian: false,
			isFeatured: true,
			isAvailable: true,
			createdAt: now,
			updatedAt: now,
		});

		const variant1 = MenuItemVariant.reconstitute({
			id: "var-1",
			menuItemId: "item-123",
			sku: "SKU-1",
			name: "Half",
			price: 150,
			isDefault: false,
			isAvailable: true,
			createdAt: now,
			updatedAt: now,
		});

		const variant2 = MenuItemVariant.reconstitute({
			id: "var-2",
			menuItemId: "item-123",
			sku: "SKU-2",
			name: "Full",
			price: 280,
			isDefault: true,
			isAvailable: false,
			createdAt: now,
			updatedAt: now,
		});

		menuItemRepository.findByIdAndRestaurantId.mockResolvedValue({
			item,
			category: {
				id: "cat-1",
				name: "Main Course",
				description: "Delicious mains",
				isActive: true,
			},
			images: [],
			variants: [variant1, variant2],
			addons: [
				{
					id: "addon-link-1",
					menuItemId: "item-123",
					addonId: "addon-1",
					name: "Raita",
					description: "Cool yogurt",
					price: 30,
					priceOverride: null,
					imageKey: "addons/raita.png",
					isAvailable: true,
					isDeleted: false,
				},
			],
		});

		const result = await useCase.execute({
			restaurantId: "rest-123",
			menuItemId: "item-123",
		});

		expect(result.id).toBe("item-123");
		expect(result.isAvailable).toBe(true);
		expect(result.variants).toHaveLength(2);
		expect(result.variants[0].isAvailable).toBe(true);
		expect(result.variants[1].isAvailable).toBe(false);
		expect(result.addons[0].price).toBe(30);
		expect(result.addons[0].isAvailable).toBe(true);
	});
});
