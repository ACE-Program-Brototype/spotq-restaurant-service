import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { ApproveRestaurantUseCase } from "@/application/use-cases/admin/approve-restaurant.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import {
	InvalidOnboardingStatusError,
	RestaurantAlreadyProcessedError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors.ts";
import { logger } from "@/infrastructure/observability/logger.ts";

describe("ApproveRestaurantUseCase", () => {
	let useCase: ApproveRestaurantUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;

	const validRestaurantData = {
		id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
		restaurantName: "Gourmet Bistro",
		email: "bistro@example.com",
		phone: "+1234567890",
		ownerName: "Alice Smith",
		ownerEmail: "alice@example.com",
		status: "PENDING",
		onboardingStatus: "COMPLETED",
		emailVerifiedAt: new Date(),
		isBlocked: false,
		blockReason: null,
		createdAt: new Date(),
		updatedAt: new Date(),
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
		} as unknown as jest.Mocked<IRestaurantRepository>;

		jest.spyOn(logger, "info").mockImplementation(() => {});

		useCase = new ApproveRestaurantUseCase(mockRestaurantRepo);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-id",
				adminId: "admin-123",
			}),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(mockRestaurantRepo.findById).toHaveBeenCalledWith("non-existent-id");
		expect(mockRestaurantRepo.update).not.toHaveBeenCalled();
	});

	it("should throw InvalidOnboardingStatusError when onboarding is not completed", async () => {
		const pendingOnboardingRestaurant = Restaurant.reconstitute({
			...validRestaurantData,
			onboardingStatus: "PENDING",
		});

		mockRestaurantRepo.findById.mockResolvedValue(pendingOnboardingRestaurant);

		await expect(
			useCase.execute({
				restaurantId: validRestaurantData.id,
				adminId: "admin-123",
			}),
		).rejects.toThrow(InvalidOnboardingStatusError);

		expect(mockRestaurantRepo.update).not.toHaveBeenCalled();
	});

	it("should throw RestaurantAlreadyProcessedError when restaurant is already approved", async () => {
		const alreadyApprovedRestaurant = Restaurant.reconstitute({
			...validRestaurantData,
			status: "APPROVED",
		});

		mockRestaurantRepo.findById.mockResolvedValue(alreadyApprovedRestaurant);

		await expect(
			useCase.execute({
				restaurantId: validRestaurantData.id,
				adminId: "admin-123",
			}),
		).rejects.toThrow(RestaurantAlreadyProcessedError);

		expect(mockRestaurantRepo.update).not.toHaveBeenCalled();
	});

	it("should successfully approve restaurant, update repository, log audit event, and return response", async () => {
		const restaurant = Restaurant.reconstitute(validRestaurantData);
		mockRestaurantRepo.findById.mockResolvedValue(restaurant);
		mockRestaurantRepo.update.mockResolvedValue(restaurant);

		const result = await useCase.execute({
			restaurantId: validRestaurantData.id,
			adminId: "admin-456",
		});

		expect(restaurant.status).toBe("APPROVED");
		expect(mockRestaurantRepo.update).toHaveBeenCalledWith(
			validRestaurantData.id,
			{
				status: "APPROVED",
				rejectionReason: null,
			},
		);

		expect(logger.info).toHaveBeenCalledWith(
			expect.objectContaining({
				adminId: "admin-456",
				restaurantId: validRestaurantData.id,
				event: "restaurant.approved",
			}),
			expect.stringContaining("approved"),
		);

		expect(result).toMatchObject({
			id: validRestaurantData.id,
			restaurantName: validRestaurantData.restaurantName,
			status: "APPROVED",
			reviewedBy: "admin-456",
		});
		expect(result.reviewedAt).toBeInstanceOf(Date);
	});
});
