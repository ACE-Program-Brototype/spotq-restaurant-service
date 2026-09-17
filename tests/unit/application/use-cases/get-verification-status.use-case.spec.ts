import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import { GetRestaurantVerificationStatusUseCase } from "@/application/use-cases/get-verification-status.use-case";
import { Restaurant } from "@/domain/entities/restaurant.entity";

describe("GetRestaurantVerificationStatusUseCase", () => {
	let useCase: GetRestaurantVerificationStatusUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;

	beforeEach(() => {
		mockRestaurantRepo = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		useCase = new GetRestaurantVerificationStatusUseCase(mockRestaurantRepo);
	});

	it("throws RestaurantNotFoundError if restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(null);

		await expect(useCase.execute("non-existent-id")).rejects.toThrow(
			"Restaurant not found",
		);
	});

	it("returns VERIFIED when restaurant status is APPROVED", async () => {
		const restaurant = Restaurant.reconstitute({
			id: "res-123",
			restaurantName: "Approved Rest",
			email: "test@example.com",
			phone: "1234567890",
			ownerName: "Owner",
			ownerEmail: "test@example.com",
			status: "APPROVED",
			onboardingStatus: "COMPLETED",
			emailVerifiedAt: new Date(),
			isBlocked: false,
			blockReason: null,
			createdAt: new Date("2026-01-01T00:00:00.000Z"),
			updatedAt: new Date("2026-01-02T00:00:00.000Z"),
		});

		mockRestaurantRepo.findById.mockResolvedValue(restaurant);

		const result = await useCase.execute("res-123");

		expect(result.status).toBe("VERIFIED");
		expect(result.rejectionReason).toBeUndefined();
	});

	it("returns REJECTED when restaurant status is REJECTED", async () => {
		const restaurant = Restaurant.reconstitute({
			id: "res-123",
			restaurantName: "Rejected Rest",
			email: "test@example.com",
			phone: "1234567890",
			ownerName: "Owner",
			ownerEmail: "test@example.com",
			status: "REJECTED",
			onboardingStatus: "COMPLETED",
			emailVerifiedAt: new Date(),
			isBlocked: false,
			blockReason: "Invalid documents submitted",
			createdAt: new Date("2026-01-01T00:00:00.000Z"),
			updatedAt: new Date("2026-01-02T00:00:00.000Z"),
		});

		mockRestaurantRepo.findById.mockResolvedValue(restaurant);

		const result = await useCase.execute("res-123");

		expect(result.status).toBe("REJECTED");
		expect(result.rejectionReason).toBe("Invalid documents submitted");
	});

	it("returns UNDER_REVIEW when onboarding is COMPLETED and status is PENDING", async () => {
		const restaurant = Restaurant.reconstitute({
			id: "res-123",
			restaurantName: "Submitted Rest",
			email: "test@example.com",
			phone: "1234567890",
			ownerName: "Owner",
			ownerEmail: "test@example.com",
			status: "PENDING",
			onboardingStatus: "COMPLETED",
			emailVerifiedAt: new Date(),
			isBlocked: false,
			blockReason: null,
			createdAt: new Date("2026-01-01T00:00:00.000Z"),
			updatedAt: new Date("2026-01-02T00:00:00.000Z"),
		});

		mockRestaurantRepo.findById.mockResolvedValue(restaurant);

		const result = await useCase.execute("res-123");

		expect(result.status).toBe("UNDER_REVIEW");
		expect(result.rejectionReason).toBeUndefined();
	});

	it("returns SUBMITTED when onboarding is PENDING and status is PENDING", async () => {
		const restaurant = Restaurant.reconstitute({
			id: "res-123",
			restaurantName: "Pending Rest",
			email: "test@example.com",
			phone: "1234567890",
			ownerName: "Owner",
			ownerEmail: "test@example.com",
			status: "PENDING",
			onboardingStatus: "PENDING",
			emailVerifiedAt: new Date(),
			isBlocked: false,
			blockReason: null,
			createdAt: new Date("2026-01-01T00:00:00.000Z"),
			updatedAt: new Date("2026-01-02T00:00:00.000Z"),
		});

		mockRestaurantRepo.findById.mockResolvedValue(restaurant);

		const result = await useCase.execute("res-123");

		expect(result.status).toBe("SUBMITTED");
	});
});
