import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import { OnboardRestaurantUseCase } from "@/application/use-cases/onboard-restaurant.use-case";
import { Restaurant } from "@/domain/entities/restaurant.entity";

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
			save: jest.fn(),
			completeOnboarding: jest.fn(),
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

	it("completes restaurant onboarding successfully when found", async () => {
		const mockRestaurant = Restaurant.reconstitute({
			id: "res-123",
			restaurantName: "Pending Name",
			email: "test@example.com",
			phone: "1234567890",
			ownerName: "Owner Name",
			ownerEmail: "test@example.com",
			status: "PENDING",
			onboardingStatus: "PENDING",
			emailVerifiedAt: new Date(),
			isBlocked: false,
			blockReason: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		mockRestaurantRepo.findById.mockResolvedValue(mockRestaurant);
		mockRestaurantRepo.completeOnboarding.mockResolvedValue(mockRestaurant);

		const dto = {
			restaurantName: "New Name",
			phone: "9876543210",
			ownerName: "Jane",
		};

		await useCase.execute(dto, "res-123");

		expect(mockRestaurantRepo.completeOnboarding).toHaveBeenCalledWith(
			"res-123",
			dto,
		);
	});
});
