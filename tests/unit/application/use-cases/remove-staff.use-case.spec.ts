import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { RemoveStaffUseCase } from "@/application/use-cases/staff/remove-staff.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	RestaurantNotFoundError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

describe("RemoveStaffUseCase", () => {
	let staffRepository: jest.Mocked<Required<IRestaurantStaffRepository>>;
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let useCase: RemoveStaffUseCase;

	const mockRestaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const mockStaffId = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01";

	const mockRestaurant = Restaurant.create({
		id: mockRestaurantId,
		restaurantName: "Spicy Route",
		email: "owner@spiceroute.com",
		phone: "+919876543210",
		ownerName: "Owner Name",
		ownerEmail: "owner@spiceroute.com",
		status: "ACTIVE",
	});

	const createMockStaff = (
		role = "STAFF",
		status = "ACTIVE",
		restaurantId = mockRestaurantId,
	) => {
		return RestaurantStaff.reconstitute({
			id: mockStaffId,
			restaurantId,
			fullname: "Chef John",
			email: "john@spiceroute.com",
			phone: "+919876543210",
			avatarUrl: null,
			role,
			status,
			createdAt: new Date("2026-01-01T12:00:00.000Z"),
			updatedAt: new Date("2026-01-01T12:00:00.000Z"),
		});
	};

	beforeEach(() => {
		staffRepository = {
			findById: jest.fn(),
			exists: jest.fn(),
			findByEmail: jest.fn(),
			findByRestaurantId: jest.fn(),
			findByIdAndRestaurantId: jest.fn(),
			removeStaff: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
		};

		restaurantRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			existsByEmail: jest.fn(),
			createRestaurant: jest.fn(),
			create: jest.fn(),
			findUnique: jest.fn(),
			find: jest.fn(),
			update: jest.fn(),
			completeOnboarding: jest.fn(),
		};

		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(
			createMockStaff(),
		);
		staffRepository.removeStaff.mockResolvedValue();

		useCase = new RemoveStaffUseCase(staffRepository, restaurantRepository);
	});

	it("should successfully remove a staff member", async () => {
		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
			}),
		).resolves.toBeUndefined();

		expect(restaurantRepository.findById).toHaveBeenCalledWith(
			mockRestaurantId,
		);
		expect(staffRepository.findByIdAndRestaurantId).toHaveBeenCalledWith(
			mockStaffId,
			mockRestaurantId,
		);
		expect(staffRepository.removeStaff).toHaveBeenCalledWith(
			mockStaffId,
			mockRestaurantId,
		);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-restaurant",
				staffId: mockStaffId,
			}),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(staffRepository.removeStaff).not.toHaveBeenCalled();
	});

	it("should throw StaffNotFoundError when staff member does not exist or belongs to another restaurant", async () => {
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: "other-staff-id",
			}),
		).rejects.toThrow(StaffNotFoundError);

		expect(staffRepository.removeStaff).not.toHaveBeenCalled();
	});

	it("should throw StaffNotFoundError when account is not a staff member", async () => {
		const nonStaff = createMockStaff();
		Object.defineProperty(nonStaff, "role", { get: () => "ADMIN" });
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(nonStaff);

		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
			}),
		).rejects.toThrow(StaffNotFoundError);

		expect(staffRepository.removeStaff).not.toHaveBeenCalled();
	});

	it("should throw StaffNotFoundError when staff member is already removed", async () => {
		const removedStaff = createMockStaff("STAFF", "REMOVED");
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(removedStaff);

		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
			}),
		).rejects.toThrow(StaffNotFoundError);

		expect(staffRepository.removeStaff).not.toHaveBeenCalled();
	});
});
