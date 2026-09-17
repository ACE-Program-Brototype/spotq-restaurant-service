import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { GetRestaurantApplicationDetailsUseCase } from "@/application/use-cases/admin/get-restaurant-application-details.use-case.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";

describe("GetRestaurantApplicationDetailsUseCase", () => {
	let useCase: GetRestaurantApplicationDetailsUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;

	const mockDetails = {
		id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
		restaurantName: "Gourmet Bistro",
		email: "bistro@example.com",
		phone: "+1234567890",
		ownerName: "Alice Smith",
		ownerEmail: "alice@example.com",
		status: "PENDING",
		onboardingStatus: "COMPLETED",
		emailVerifiedAt: new Date(),
		rejectionReason: null,
		createdAt: new Date("2026-03-01T00:00:00Z"),
		updatedAt: new Date("2026-03-01T00:00:00Z"),
		address: {
			id: "addr-1",
			restaurantId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
			addressLine1: "123 Main St",
			addressLine2: null,
			city: "Kochi",
			state: "Kerala",
			country: "India",
			pincode: "682001",
			latitude: 9.9312,
			longitude: 76.2673,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		documents: [
			{
				id: "doc-1",
				restaurantId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
				documentType: "FSSAI",
				documentName: "fssai_cert.pdf",
				documentKey: "docs/fssai.pdf",
				verificationStatus: "PENDING",
				uploadedAt: new Date(),
			},
		],
		images: [
			{
				id: "img-1",
				restaurantId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
				objectKey: "images/img1.jpg",
				displayOrder: 1,
				createdAt: new Date(),
			},
		],
	};

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
			findApplicationsWithFilters: jest.fn(),
			findByIdWithDetails: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		useCase = new GetRestaurantApplicationDetailsUseCase(mockRestaurantRepo);
	});

	it("should throw RestaurantNotFoundError when restaurant is not found", async () => {
		mockRestaurantRepo.findByIdWithDetails.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-id",
			}),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(mockRestaurantRepo.findByIdWithDetails).toHaveBeenCalledWith(
			"non-existent-id",
		);
	});

	it("should return full restaurant application details when found", async () => {
		mockRestaurantRepo.findByIdWithDetails.mockResolvedValue(mockDetails);

		const result = await useCase.execute({
			restaurantId: mockDetails.id,
		});

		expect(mockRestaurantRepo.findByIdWithDetails).toHaveBeenCalledWith(
			mockDetails.id,
		);
		expect(result).toEqual(mockDetails);
	});
});
