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
				{
					restaurantName: "Test",
					phone: "1234567890",
					ownerName: "John",
					seatingCapacity: 50,
					location: {
						addressLine1: "123 Main St",
						city: "City",
						state: "State",
						country: "Country",
						pincode: "123456",
						latitude: 10,
						longitude: 20,
					},
					documents: {
						fssai: { documentName: "FSSAI", documentKey: "key1" },
						businessRegistration: {
							documentName: "Reg",
							documentKey: "key2",
						},
						ownerIdentity: { documentName: "ID", documentKey: "key3" },
						gst: { documentName: "GST", documentKey: "key4" },
						businessPan: { documentName: "PAN", documentKey: "key5" },
					},
					restaurantImages: [{ objectKey: "img1", displayOrder: 1 }],
				},
				"res-123",
			),
		).rejects.toThrow("Restaurant not found");
	});

	it("throws an error if restaurant is blocked", async () => {
		const blockedRestaurant = Restaurant.reconstitute({
			id: "res-123",
			restaurantName: "Blocked Rest",
			email: "blocked@example.com",
			phone: "1234567890",
			ownerName: "Owner",
			ownerEmail: "blocked@example.com",
			status: "PENDING",
			onboardingStatus: "PENDING",
			emailVerifiedAt: new Date(),
			isBlocked: true,
			blockReason: "Violation",
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		mockRestaurantRepo.findById.mockResolvedValue(blockedRestaurant);

		await expect(
			useCase.execute(
				{
					restaurantName: "New Name",
					phone: "9876543210",
					ownerName: "Jane",
					seatingCapacity: 50,
					location: {
						addressLine1: "123 Main St",
						city: "City",
						state: "State",
						country: "Country",
						pincode: "123456",
						latitude: 10,
						longitude: 20,
					},
					documents: {
						fssai: { documentName: "FSSAI", documentKey: "key1" },
						businessRegistration: {
							documentName: "Reg",
							documentKey: "key2",
						},
						ownerIdentity: { documentName: "ID", documentKey: "key3" },
						gst: { documentName: "GST", documentKey: "key4" },
						businessPan: { documentName: "PAN", documentKey: "key5" },
					},
					restaurantImages: [{ objectKey: "img1", displayOrder: 1 }],
				},
				"res-123",
			),
		).rejects.toThrow();
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
			seatingCapacity: 50,
			location: {
				addressLine1: "123 Main St",
				city: "City",
				state: "State",
				country: "Country",
				pincode: "123456",
				latitude: 10,
				longitude: 20,
			},
			documents: {
				fssai: { documentName: "FSSAI", documentKey: "key1" },
				businessRegistration: {
					documentName: "Reg",
					documentKey: "key2",
				},
				ownerIdentity: { documentName: "ID", documentKey: "key3" },
				gst: { documentName: "GST", documentKey: "key4" },
				businessPan: { documentName: "PAN", documentKey: "key5" },
			},
			restaurantImages: [{ objectKey: "img1", displayOrder: 1 }],
		};

		await useCase.execute(dto, "res-123");

		expect(mockRestaurantRepo.completeOnboarding).toHaveBeenCalledWith(
			expect.any(Restaurant),
			dto,
		);
		expect(mockRestaurant.onboardingStatus).toBe("COMPLETED");
	});
});
