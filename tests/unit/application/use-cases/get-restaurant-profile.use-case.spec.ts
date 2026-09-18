import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IStorageService } from "@/application/ports/services/storage.service.port";
import { GetRestaurantProfileUseCase } from "@/application/use-cases/get-restaurant-profile.use-case";

describe("GetRestaurantProfileUseCase", () => {
	let useCase: GetRestaurantProfileUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockStorageService: jest.Mocked<IStorageService>;

	beforeEach(() => {
		mockRestaurantRepo = {
			getRestaurantProfileDetails: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockStorageService = {
			generatePresignedGetUrl: jest.fn().mockResolvedValue({
				downloadUrl:
					"https://s3.amazonaws.com/test-bucket/avatar-presigned-url",
				expiresInSeconds: 900,
			}),
			generatePresignedUploadUrl: jest.fn(),
		};

		useCase = new GetRestaurantProfileUseCase(
			mockRestaurantRepo,
			mockStorageService,
		);
	});

	it("throws RestaurantNotFoundError if restaurant profile is not found", async () => {
		(
			mockRestaurantRepo.getRestaurantProfileDetails as jest.Mock
		).mockResolvedValue(null);

		await expect(useCase.execute("non-existent-id")).rejects.toThrow(
			"Restaurant not found",
		);
	});

	it("presigns avatar.png when avatarUpdatedAt is set", async () => {
		const mockResponse = {
			restaurant: {
				name: "Spice Garden",
				phone: "+919876543210",
				ownerName: "John Doe",
			},
			profile: {
				logo: null,
				avatarUpdatedAt: new Date("2026-09-18T10:00:00Z"),
				coverImage: null,
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
			businessHours: [],
		};

		(
			mockRestaurantRepo.getRestaurantProfileDetails as jest.Mock
		).mockResolvedValue(mockResponse);

		const result = await useCase.execute("res-123");

		expect(mockStorageService.generatePresignedGetUrl).toHaveBeenCalledWith({
			key: "restaurants/res-123/profile/avatar.png",
		});
		expect(result.profile.logo).toBe(
			"https://s3.amazonaws.com/test-bucket/avatar-presigned-url",
		);
	});

	it("does not call S3 storage when avatarUpdatedAt is null", async () => {
		const mockResponse = {
			restaurant: {
				name: "Spice Garden",
				phone: "+919876543210",
				ownerName: "John Doe",
			},
			profile: {
				logo: null,
				avatarUpdatedAt: null,
				coverImage: null,
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
			businessHours: [],
		};

		(
			mockRestaurantRepo.getRestaurantProfileDetails as jest.Mock
		).mockResolvedValue(mockResponse);

		const result = await useCase.execute("res-123");

		expect(mockStorageService.generatePresignedGetUrl).not.toHaveBeenCalled();
		expect(result.profile.logo).toBeNull();
	});
});
