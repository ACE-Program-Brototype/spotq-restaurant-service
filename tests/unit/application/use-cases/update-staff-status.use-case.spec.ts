import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { UpdateStaffStatusUseCase } from "@/application/use-cases/staff/update-staff-status.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	InvalidStaffStatusError,
	RestaurantNotFoundError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

describe("UpdateStaffStatusUseCase", () => {
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let useCase: UpdateStaffStatusUseCase;

	const mockRestaurantId = "11111111-1111-1111-1111-111111111111";
	const mockStaffId = "22222222-2222-2222-2222-222222222222";

	const mockRestaurant = Restaurant.create({
		id: mockRestaurantId,
		restaurantName: "Spice Garden",
		email: "owner@spicegarden.com",
		phone: "+919876543210",
		ownerName: "Owner Name",
		ownerEmail: "owner@spicegarden.com",
		status: "ACTIVE",
	});

	const createMockStaff = (status = "ACTIVE", role = "STAFF") => {
		return RestaurantStaff.reconstitute({
			id: mockStaffId,
			restaurantId: mockRestaurantId,
			fullname: "John Staff",
			email: "john@spicegarden.com",
			phone: "+919876543210",
			avatarUrl: null,
			passwordHash: "hash",
			role,
			status,
			createdAt: new Date("2026-09-01T10:00:00Z"),
			updatedAt: new Date("2026-09-01T10:00:00Z"),
		});
	};

	beforeEach(() => {
		staffRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByRestaurantId: jest.fn(),
			findByIdAndRestaurantId: jest.fn(),
			updateStatus: jest.fn(),
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
		};

		useCase = new UpdateStaffStatusUseCase(
			staffRepository,
			restaurantRepository,
		);
	});

	it("should successfully deactivate an ACTIVE staff member", async () => {
		const staff = createMockStaff("ACTIVE");
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(staff);

		const updatedStaff = createMockStaff("INACTIVE");
		staffRepository.updateStatus.mockResolvedValue(updatedStaff);

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
			staffId: mockStaffId,
			status: "INACTIVE",
		});

		expect(restaurantRepository.findById).toHaveBeenCalledWith(
			mockRestaurantId,
		);
		expect(staffRepository.findByIdAndRestaurantId).toHaveBeenCalledWith(
			mockStaffId,
			mockRestaurantId,
		);
		expect(staffRepository.updateStatus).toHaveBeenCalledWith(
			mockStaffId,
			"INACTIVE",
		);
		expect(result).toEqual({
			id: mockStaffId,
			restaurant_id: mockRestaurantId,
			fullname: "John Staff",
			email: "john@spicegarden.com",
			phone: "+919876543210",
			avatar_url: null,
			role: "STAFF",
			status: "INACTIVE",
			created_at: staff.createdAt.toISOString(),
		});
	});

	it("should successfully activate an INACTIVE staff member", async () => {
		const staff = createMockStaff("INACTIVE");
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(staff);

		const updatedStaff = createMockStaff("ACTIVE");
		staffRepository.updateStatus.mockResolvedValue(updatedStaff);

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
			staffId: mockStaffId,
			status: "ACTIVE",
		});

		expect(staffRepository.updateStatus).toHaveBeenCalledWith(
			mockStaffId,
			"ACTIVE",
		);
		expect(result.status).toBe("ACTIVE");
	});

	it("should handle same-status request idempotently without calling updateStatus", async () => {
		const staff = createMockStaff("ACTIVE");
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(staff);

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
			staffId: mockStaffId,
			status: "ACTIVE",
		});

		expect(staffRepository.updateStatus).not.toHaveBeenCalled();
		expect(result).toEqual({
			id: mockStaffId,
			restaurant_id: mockRestaurantId,
			fullname: "John Staff",
			email: "john@spicegarden.com",
			phone: "+919876543210",
			avatar_url: null,
			role: "STAFF",
			status: "ACTIVE",
			created_at: staff.createdAt.toISOString(),
		});
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
				status: "ACTIVE",
			}),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(staffRepository.findByIdAndRestaurantId).not.toHaveBeenCalled();
	});

	it("should throw StaffNotFoundError when staff is not found for the given restaurant", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
				status: "ACTIVE",
			}),
		).rejects.toThrow(StaffNotFoundError);
	});

	it("should throw StaffNotFoundError when account is not a staff member", async () => {
		const nonStaff = createMockStaff("ACTIVE", "STAFF");
		// Override role getter property to return something else
		Object.defineProperty(nonStaff, "role", { value: "MANAGER" });

		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(nonStaff);

		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
				status: "ACTIVE",
			}),
		).rejects.toThrow(StaffNotFoundError);
	});

	it("should throw InvalidStaffStatusError for unsupported status", async () => {
		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
				status: "BLOCKED" as unknown as "ACTIVE",
			}),
		).rejects.toThrow(InvalidStaffStatusError);
	});
});
