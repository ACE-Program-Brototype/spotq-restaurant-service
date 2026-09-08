import { RestaurantStatus } from "@prisma/client";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { GetRestaurantStatusUseCase } from "@/application/use-cases/get-restaurant-status.use-case.ts";
import { RESTAURANT_NAVIGATION_TARGETS } from "@/shared/constants/navigation.constants.ts";

describe("GetRestaurantStatusUseCase", () => {
	let useCase: GetRestaurantStatusUseCase;
	let mockRestaurantRepository: jest.Mocked<IRestaurantRepository>;

	beforeEach(() => {
		mockRestaurantRepository = {
			create: jest.fn(),
			findById: jest.fn(),
			findUnique: jest.fn(),
			find: jest.fn(),
			existsByEmail: jest.fn(),
			createRestaurant: jest.fn(),
			findByEmail: jest.fn(),
		};
		useCase = new GetRestaurantStatusUseCase(mockRestaurantRepository);
		jest.clearAllMocks();
	});

	it("should return null if restaurantId is not provided", async () => {
		const result = await useCase.execute("");
		expect(result).toBeNull();
		expect(mockRestaurantRepository.findById).not.toHaveBeenCalled();
	});

	it("should return navigationTarget '/restaurant/subscription' when restaurant is APPROVED but has no active subscription", async () => {
		const mockRestaurant = {
			id: "rest-123",
			restaurantName: "Grand Bistro",
			email: "bistro@example.com",
			phone: "+919876543210",
			ownerName: "Owner",
			ownerEmail: "owner@example.com",
			status: RestaurantStatus.APPROVED,
			onboardingStatus: "COMPLETED",
			isSubscriptionActive: false,
			subscriptionPlanCode: null,
			subscriptionEndsAt: null,
			emailVerifiedAt: new Date(),
			isBlocked: false,
			blockReason: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		mockRestaurantRepository.findById.mockResolvedValueOnce(
			mockRestaurant as unknown as never,
		);

		const result = await useCase.execute("rest-123");

		expect(result).toEqual({
			restaurantId: "rest-123",
			restaurantName: "Grand Bistro",
			verificationStatus: "APPROVED",
			isSubscriptionActive: false,
			subscriptionPlanCode: null,
			subscriptionEndsAt: null,
			navigationTarget: RESTAURANT_NAVIGATION_TARGETS.SUBSCRIPTION,
		});
		expect(mockRestaurantRepository.findById).toHaveBeenCalledWith("rest-123");
	});

	it("should return navigationTarget '/restaurant/dashboard' when restaurant has active subscription", async () => {
		const futureDate = new Date(Date.now() + 86400000 * 30);
		const mockRestaurant = {
			id: "rest-123",
			restaurantName: "Grand Bistro",
			email: "bistro@example.com",
			phone: "+919876543210",
			ownerName: "Owner",
			ownerEmail: "owner@example.com",
			status: RestaurantStatus.ACTIVE,
			onboardingStatus: "COMPLETED",
			isSubscriptionActive: true,
			subscriptionPlanCode: "QUEUE_PRO",
			subscriptionEndsAt: futureDate,
			emailVerifiedAt: new Date(),
			isBlocked: false,
			blockReason: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		mockRestaurantRepository.findById.mockResolvedValueOnce(
			mockRestaurant as unknown as never,
		);

		const result = await useCase.execute("rest-123");

		expect(result?.isSubscriptionActive).toBe(true);
		expect(result?.navigationTarget).toBe(
			RESTAURANT_NAVIGATION_TARGETS.DASHBOARD,
		);
		expect(result?.subscriptionPlanCode).toBe("QUEUE_PRO");
	});

	it("should return navigationTarget '/restaurant/onboarding' when restaurant is PENDING", async () => {
		const mockRestaurant = {
			id: "rest-123",
			restaurantName: "Grand Bistro",
			email: "bistro@example.com",
			phone: "+919876543210",
			ownerName: "Owner",
			ownerEmail: "owner@example.com",
			status: RestaurantStatus.PENDING,
			onboardingStatus: "PENDING",
			isSubscriptionActive: false,
			subscriptionPlanCode: null,
			subscriptionEndsAt: null,
			emailVerifiedAt: new Date(),
			isBlocked: false,
			blockReason: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		mockRestaurantRepository.findById.mockResolvedValueOnce(
			mockRestaurant as unknown as never,
		);

		const result = await useCase.execute("rest-123");

		expect(result?.navigationTarget).toBe(
			RESTAURANT_NAVIGATION_TARGETS.ONBOARDING,
		);
	});
});

