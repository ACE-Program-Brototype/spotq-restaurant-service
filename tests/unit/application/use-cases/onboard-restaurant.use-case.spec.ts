import { OnboardRestaurantUseCase } from "@/application/use-cases/onboard-restaurant.use-case";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";

describe("OnboardRestaurantUseCase", () => {
	let useCase: OnboardRestaurantUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;

	beforeEach(() => {
		mockRestaurantRepo = {
			findByEmail: jest.fn(),
			createRestaurant: jest.fn(),
			existsByEmail: jest.fn(),
			findById: jest.fn(),
			findUnique: jest.fn(),
			find: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		useCase = new OnboardRestaurantUseCase(mockRestaurantRepo);
	});

	it("throws an error if restaurant is not found", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(null);

		await expect(
			useCase.execute(
				{ restaurantName: "Test", phone: "1234567890", ownerName: "John" },
				"res-123",
			),
		).rejects.toThrow("Restaurant not found");
	});

	it("updates restaurant details successfully when found", async () => {
		const mockRestaurant = {
			id: "res-123",
			restaurantName: "",
			email: "test@example.com",
			phone: "",
			ownerName: "",
			ownerEmail: "test@example.com",
			status: "PENDING",
			onboardingStatus: "PENDING",
			emailVerifiedAt: new Date(),
			isBlocked: false,
			blockReason: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		mockRestaurantRepo.findById.mockResolvedValue(mockRestaurant);

		mockRestaurantRepo.update.mockResolvedValue(mockRestaurant);

		await useCase.execute(
			{ restaurantName: "New Name", phone: "9876543210", ownerName: "Jane" },
			"res-123",
		);

		expect(mockRestaurantRepo.update).toHaveBeenCalledWith("res-123", {
			restaurantName: "New Name",
			phone: "9876543210",
			ownerName: "Jane",
		});
	});
});
