import type { UpdateRestaurantProfileDto } from "@/application/dtos/restaurant/update-restaurant-profile.dto";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IStorageService } from "@/application/ports/services/storage.service.port";
import { UpdateRestaurantProfileUseCase } from "@/application/use-cases/update-restaurant-profile.use-case";
import { Restaurant } from "@/domain/entities/restaurant.entity";

describe("UpdateRestaurantProfileUseCase", () => {
	let useCase: UpdateRestaurantProfileUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockStorageService: jest.Mocked<IStorageService>;

	beforeEach(() => {
		mockRestaurantRepo = {
			findById: jest.fn(),
			updateProfileDetails: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockStorageService = {
			generatePresignedGetUrl: jest.fn().mockResolvedValue({
				downloadUrl: "https://s3.amazonaws.com/test-bucket/avatar-presigned-url",
				expiresInSeconds: 900,
			}),
			generatePresignedUploadUrl: jest.fn(),
		};

		useCase = new UpdateRestaurantProfileUseCase(
			mockRestaurantRepo,
			mockStorageService,
		);
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
			hasAvatar: true,
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

	it("updates restaurant profile details and presigns avatar when avatarUpdatedAt is set", async () => {
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
				logo: null,
				avatarUpdatedAt: new Date("2026-09-18T10:00:00Z"),
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

		expect(mockRestaurantRepo.findById).toHaveBeenCalledWith("res-123");
		expect(mockRestaurantRepo.updateProfileDetails).toHaveBeenCalledWith(
			"res-123",
			mockDto,
		);
		expect(mockStorageService.generatePresignedGetUrl).toHaveBeenCalledWith({
			key: "restaurants/res-123/profile/avatar.png",
		});
		expect(result.profile.logo).toBe(
			"https://s3.amazonaws.com/test-bucket/avatar-presigned-url",
		);
	});
});
