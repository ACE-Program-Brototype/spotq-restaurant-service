import { RestaurantStatus } from "@prisma/client";
import { GetRestaurantStatusUseCase } from "@/application/use-cases/get-restaurant-status.use-case.ts";
import { prisma } from "@/config/prisma.ts";

describe("GetRestaurantStatusUseCase", () => {
	let useCase: GetRestaurantStatusUseCase;

	beforeEach(() => {
		useCase = new GetRestaurantStatusUseCase();
		jest.clearAllMocks();
	});

	it("should return null if restaurantId is not provided", async () => {
		const result = await useCase.execute("");
		expect(result).toBeNull();
	});

	it("should return navigationTarget '/restaurant/subscription' when restaurant is APPROVED but has no active subscription", async () => {
		const mockRestaurant = {
			id: "rest-123",
			restaurantName: "Grand Bistro",
			status: RestaurantStatus.APPROVED,
			isSubscriptionActive: false,
			subscriptionPlanCode: null,
			subscriptionEndsAt: null,
			isBlocked: false,
		};

		jest
			.spyOn(prisma.restaurant, "findUnique")
			.mockResolvedValueOnce(mockRestaurant as unknown as never);

		const result = await useCase.execute("rest-123");

		expect(result).toEqual({
			restaurantId: "rest-123",
			restaurantName: "Grand Bistro",
			verificationStatus: "APPROVED",
			isSubscriptionActive: false,
			subscriptionPlanCode: null,
			subscriptionEndsAt: null,
			navigationTarget: "/restaurant/subscription",
		});
	});

	it("should return navigationTarget '/restaurant/dashboard' when restaurant has active subscription", async () => {
		const futureDate = new Date(Date.now() + 86400000 * 30);
		const mockRestaurant = {
			id: "rest-123",
			restaurantName: "Grand Bistro",
			status: RestaurantStatus.ACTIVE,
			isSubscriptionActive: true,
			subscriptionPlanCode: "QUEUE_PRO",
			subscriptionEndsAt: futureDate,
			isBlocked: false,
		};

		jest
			.spyOn(prisma.restaurant, "findUnique")
			.mockResolvedValueOnce(mockRestaurant as unknown as never);

		const result = await useCase.execute("rest-123");

		expect(result?.isSubscriptionActive).toBe(true);
		expect(result?.navigationTarget).toBe("/restaurant/dashboard");
		expect(result?.subscriptionPlanCode).toBe("QUEUE_PRO");
	});

	it("should return navigationTarget '/restaurant/onboarding' when restaurant is PENDING", async () => {
		const mockRestaurant = {
			id: "rest-123",
			restaurantName: "Grand Bistro",
			status: RestaurantStatus.PENDING,
			isSubscriptionActive: false,
			subscriptionPlanCode: null,
			subscriptionEndsAt: null,
			isBlocked: false,
		};

		jest
			.spyOn(prisma.restaurant, "findUnique")
			.mockResolvedValueOnce(mockRestaurant as unknown as never);

		const result = await useCase.execute("rest-123");

		expect(result?.navigationTarget).toBe("/restaurant/onboarding");
	});
});
