import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { BlockRestaurantUseCase } from "@/application/use-cases/admin/block-restaurant.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import {
	InvalidOnboardingStatusError,
	InvalidRestaurantStatusError,
	RestaurantAlreadyBlockedError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors.ts";

describe("BlockRestaurantUseCase", () => {
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let useCase: BlockRestaurantUseCase;

	const createMockRestaurant = (
		isBlocked = false,
		status = "ACTIVE",
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
			blockReason: isBlocked ? "Previous violation" : null,
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

		useCase = new BlockRestaurantUseCase(restaurantRepository);
	});

	it("should block an active restaurant successfully when valid reason is provided", async () => {
		const restaurant = createMockRestaurant(false);
		restaurantRepository.findById.mockResolvedValue(restaurant);
		restaurantRepository.update.mockResolvedValue(restaurant);

		const result = await useCase.execute({
			restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			reason: "Repeated food safety violations",
			adminId: "admin-123",
		});

		expect(restaurantRepository.findById).toHaveBeenCalledWith(
			"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		);
		expect(restaurantRepository.update).toHaveBeenCalledWith(
			"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			{
				isBlocked: true,
				blockReason: "Repeated food safety violations",
				status: "SUSPENDED",
			},
		);
		expect(result.id).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
		expect(result.restaurantName).toBe("Spice Garden");
		expect(result.isBlocked).toBe(true);
		expect(result.status).toBe("SUSPENDED");
		expect(result.blockReason).toBe("Repeated food safety violations");
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-id",
				reason: "Some reason",
				adminId: "admin-123",
			}),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(restaurantRepository.update).not.toHaveBeenCalled();
	});

	it("should throw InvalidRestaurantStatusError when restaurant status is PENDING", async () => {
		const pendingRestaurant = createMockRestaurant(
			false,
			"PENDING",
			"COMPLETED",
		);
		restaurantRepository.findById.mockResolvedValue(pendingRestaurant);

		await expect(
			useCase.execute({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				reason: "Block attempt",
				adminId: "admin-123",
			}),
		).rejects.toThrow(InvalidRestaurantStatusError);

		expect(restaurantRepository.update).not.toHaveBeenCalled();
	});

	it("should throw InvalidOnboardingStatusError when restaurant onboarding is not COMPLETED", async () => {
		const incompleteRestaurant = createMockRestaurant(
			false,
			"ACTIVE",
			"PENDING",
		);
		restaurantRepository.findById.mockResolvedValue(incompleteRestaurant);

		await expect(
			useCase.execute({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				reason: "Block attempt",
				adminId: "admin-123",
			}),
		).rejects.toThrow(InvalidOnboardingStatusError);

		expect(restaurantRepository.update).not.toHaveBeenCalled();
	});

	it("should throw RestaurantAlreadyBlockedError when restaurant is already blocked", async () => {
		const blockedRestaurant = createMockRestaurant(
			true,
			"SUSPENDED",
			"COMPLETED",
		);
		restaurantRepository.findById.mockResolvedValue(blockedRestaurant);

		await expect(
			useCase.execute({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				reason: "Another block attempt",
				adminId: "admin-123",
			}),
		).rejects.toThrow(RestaurantAlreadyBlockedError);

		expect(restaurantRepository.update).not.toHaveBeenCalled();
	});
});
