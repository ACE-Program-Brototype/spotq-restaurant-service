import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import { GetRestaurantProfileUseCase } from "@/application/use-cases/get-restaurant-profile.use-case";

describe("GetRestaurantProfileUseCase", () => {
	let useCase: GetRestaurantProfileUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;

	beforeEach(() => {
		mockRestaurantRepo = {
			getRestaurantProfileDetails: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		useCase = new GetRestaurantProfileUseCase(mockRestaurantRepo);
	});

	it("throws RestaurantNotFoundError if restaurant profile is not found", async () => {
		(
			mockRestaurantRepo.getRestaurantProfileDetails as jest.Mock
		).mockResolvedValue(null);

		await expect(useCase.execute("non-existent-id")).rejects.toThrow(
			"Restaurant not found",
		);
	});

	it("returns restaurant profile details when restaurant exists", async () => {
		const mockResponse = {
			restaurant: {
				name: "Spice Garden",
				phone: "+919876543210",
				ownerName: "John Doe",
			},
			profile: {
				logo: "logo-key-123",
				coverImage: "cover-key-123",
				description: "Fine dining restaurant",
				cuisineType: "Indian",
				averageCost: 600,
			},
			settings: {
				acceptsQueue: true,
				acceptsQrOrders: true,
				loyaltyEnabled: false,
				autoAcceptQueue: false,
				seatingCapacity: 50,
			},
			businessHours: [
				{
					dayOfWeek: 1,
					openTime: "09:00",
					closeTime: "22:00",
					isClosed: false,
				},
			],
		};

		(
			mockRestaurantRepo.getRestaurantProfileDetails as jest.Mock
		).mockResolvedValue(mockResponse);

		const result = await useCase.execute("res-123");

		expect(result).toEqual(mockResponse);
		expect(mockRestaurantRepo.getRestaurantProfileDetails).toHaveBeenCalledWith(
			"res-123",
		);
	});
});
