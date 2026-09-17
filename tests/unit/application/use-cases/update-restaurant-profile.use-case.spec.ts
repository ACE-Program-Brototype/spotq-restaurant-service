import type { UpdateRestaurantProfileDto } from "@/application/dtos/restaurant/update-restaurant-profile.dto";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import { UpdateRestaurantProfileUseCase } from "@/application/use-cases/update-restaurant-profile.use-case";
import { Restaurant } from "@/domain/entities/restaurant.entity";

describe("UpdateRestaurantProfileUseCase", () => {
	let useCase: UpdateRestaurantProfileUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;

	beforeEach(() => {
		mockRestaurantRepo = {
			findById: jest.fn(),
			updateProfileDetails: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		useCase = new UpdateRestaurantProfileUseCase(mockRestaurantRepo);
	});

	const mockDto: UpdateRestaurantProfileDto = {
		restaurant: {
			name: "Updated Spice Garden",
			phone: "+919876543210",
			ownerName: "Jane Doe",
		},
		profile: {
			description: "Updated description",
			cuisineType: "North Indian",
			averageCost: 750,
			logoKey: "logo-key-new",
			coverImageKey: "cover-key-new",
		},
		settings: {
			acceptsQueue: true,
			acceptsQrOrders: false,
			loyaltyEnabled: true,
			autoAcceptQueue: true,
		},
		businessHours: [
			{
				dayOfWeek: 1,
				openTime: "10:00",
				closeTime: "23:00",
				isClosed: false,
			},
		],
	};

	it("throws error if restaurant does not exist", async () => {
		(mockRestaurantRepo.findById as jest.Mock).mockResolvedValue(null);

		await expect(useCase.execute("non-existent-id", mockDto)).rejects.toThrow(
			"Restaurant not found",
		);
		expect(mockRestaurantRepo.findById).toHaveBeenCalledWith("non-existent-id");
		expect(mockRestaurantRepo.updateProfileDetails).not.toHaveBeenCalled();
	});

	it("updates restaurant profile details successfully", async () => {
		const mockRestaurant = Restaurant.reconstitute({
			id: "res-123",
			restaurantName: "Old Name",
			email: "test@example.com",
			phone: "1234567890",
			ownerName: "Owner",
			ownerEmail: "test@example.com",
			status: "APPROVED",
			onboardingStatus: "COMPLETED",
			emailVerifiedAt: new Date(),
			isBlocked: false,
			blockReason: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		const mockResponse = {
			restaurant: {
				name: "Updated Spice Garden",
				phone: "+919876543210",
				ownerName: "Jane Doe",
			},
			profile: {
				logo: "logo-key-new",
				coverImage: "cover-key-new",
				description: "Updated description",
				cuisineType: "North Indian",
				averageCost: 750,
			},
			settings: {
				acceptsQueue: true,
				acceptsQrOrders: false,
				loyaltyEnabled: true,
				autoAcceptQueue: true,
				seatingCapacity: 50,
			},
			businessHours: [
				{
					dayOfWeek: 1,
					openTime: "10:00",
					closeTime: "23:00",
					isClosed: false,
				},
			],
		};

		(mockRestaurantRepo.findById as jest.Mock).mockResolvedValue(
			mockRestaurant,
		);
		(mockRestaurantRepo.updateProfileDetails as jest.Mock).mockResolvedValue(
			mockResponse,
		);

		const result = await useCase.execute("res-123", mockDto);

		expect(result).toEqual(mockResponse);
		expect(mockRestaurantRepo.findById).toHaveBeenCalledWith("res-123");
		expect(mockRestaurantRepo.updateProfileDetails).toHaveBeenCalledWith(
			"res-123",
			mockDto,
		);
	});
});
