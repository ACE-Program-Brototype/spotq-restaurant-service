import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { UnblockRestaurantUseCase } from "@/application/use-cases/admin/unblock-restaurant.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import {
	InvalidOnboardingStatusError,
	InvalidRestaurantStatusError,
	RestaurantNotBlockedError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors.ts";

describe("UnblockRestaurantUseCase", () => {
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let useCase: UnblockRestaurantUseCase;

	const createMockRestaurant = (
		isBlocked = true,
		status = "SUSPENDED",
		onboardingStatus = "COMPLETED",
	) => {
		return Restaurant.create({
			id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			restaurantName: "Spice Garden",
			email: "contact@spicegarden.com",
			phone: "+919876543210",
			ownerName: "John Doe",
			ownerEmail: "john@spicegarden.com",
			status,
			onboardingStatus,
			isBlocked,
			blockReason: isBlocked ? "Violation resolved" : null,
		});
	};

	beforeEach(() => {
		restaurantRepository = {
			findById: jest.fn(),
			update: jest.fn(),
			existsByEmail: jest.fn(),
			createRestaurant: jest.fn(),
			findByEmail: jest.fn(),
			findCompletedDetailsById: jest.fn(),
			updateLastLogin: jest.fn(),
			findUnique: jest.fn(),
			find: jest.fn(),
			create: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		useCase = new UnblockRestaurantUseCase(restaurantRepository);
	});

	it("should unblock a blocked restaurant successfully", async () => {
		const blockedRestaurant = createMockRestaurant(
			true,
			"SUSPENDED",
			"COMPLETED",
		);
		restaurantRepository.findById.mockResolvedValue(blockedRestaurant);
		restaurantRepository.update.mockResolvedValue(blockedRestaurant);

		const result = await useCase.execute({
			restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			adminId: "admin-123",
		});

		expect(restaurantRepository.findById).toHaveBeenCalledWith(
			"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		);
		expect(restaurantRepository.update).toHaveBeenCalledWith(
			"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			{
				isBlocked: false,
				blockReason: null,
				status: "ACTIVE",
			},
		);
		expect(result.id).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
		expect(result.restaurantName).toBe("Spice Garden");
		expect(result.isBlocked).toBe(false);
		expect(result.status).toBe("ACTIVE");
		expect(result.blockReason).toBeNull();
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-id",
				adminId: "admin-123",
			}),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(restaurantRepository.update).not.toHaveBeenCalled();
	});

	it("should throw InvalidRestaurantStatusError when restaurant status is PENDING", async () => {
		const pendingRestaurant = createMockRestaurant(
			true,
			"PENDING",
			"COMPLETED",
		);
		restaurantRepository.findById.mockResolvedValue(pendingRestaurant);

		await expect(
			useCase.execute({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				adminId: "admin-123",
			}),
		).rejects.toThrow(InvalidRestaurantStatusError);

		expect(restaurantRepository.update).not.toHaveBeenCalled();
	});

	it("should throw InvalidOnboardingStatusError when restaurant onboarding is not COMPLETED", async () => {
		const incompleteRestaurant = createMockRestaurant(
			true,
			"SUSPENDED",
			"PENDING",
		);
		restaurantRepository.findById.mockResolvedValue(incompleteRestaurant);

		await expect(
			useCase.execute({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				adminId: "admin-123",
			}),
		).rejects.toThrow(InvalidOnboardingStatusError);

		expect(restaurantRepository.update).not.toHaveBeenCalled();
	});

	it("should throw RestaurantNotBlockedError when restaurant is already active/not blocked", async () => {
		const activeRestaurant = createMockRestaurant(false, "ACTIVE", "COMPLETED");
		restaurantRepository.findById.mockResolvedValue(activeRestaurant);

		await expect(
			useCase.execute({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				adminId: "admin-123",
			}),
		).rejects.toThrow(RestaurantNotBlockedError);

		expect(restaurantRepository.update).not.toHaveBeenCalled();
	});
});
