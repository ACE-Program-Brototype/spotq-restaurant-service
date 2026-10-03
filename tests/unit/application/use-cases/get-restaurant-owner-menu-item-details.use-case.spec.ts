import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { GetRestaurantOwnerMenuItemDetailsUseCase } from "@/application/use-cases/get-restaurant-owner-menu-item-details.use-case.ts";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { MenuItemNotFoundError } from "@/domain/errors/menu-item.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";

describe("GetRestaurantOwnerMenuItemDetailsUseCase", () => {
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let menuItemRepository: jest.Mocked<IMenuItemRepository>;
	let useCase: GetRestaurantOwnerMenuItemDetailsUseCase;

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

		useCase = new GetRestaurantOwnerMenuItemDetailsUseCase(
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

	it("should return item details even if category is inactive (owner view)", async () => {
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

		const result = await useCase.execute({
			restaurantId: "rest-123",
			menuItemId: "item-123",
		});

		expect(result.id).toBe("item-123");
		expect(result.name).toBe("Biryani");
		expect(result.categoryName).toBe("Seasonal");
	});
});
