import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { GetStaffDetailUseCase } from "@/application/use-cases/staff/get-staff-detail.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	RestaurantNotFoundError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

describe("GetStaffDetailUseCase", () => {
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let useCase: GetStaffDetailUseCase;

	const dummyRestaurant = Restaurant.reconstitute({
		id: "res_01ABC",
		restaurantName: "Spice Route",
		email: "info@spiceroute.com",
		phone: "+919876543210",
		ownerName: "Alice Smith",
		ownerEmail: "owner@spiceroute.com",
		status: "ACTIVE",
		onboardingStatus: "COMPLETED",
		emailVerifiedAt: new Date("2026-01-01T10:00:00.000Z"),
		isBlocked: false,
		blockReason: null,
		createdAt: new Date("2026-01-01T10:00:00.000Z"),
		updatedAt: new Date("2026-01-01T10:00:00.000Z"),
	});

	const dummyStaff = RestaurantStaff.reconstitute({
		id: "stf_02AB",
		restaurantId: "res_01ABC",
		fullname: "Ravi Kumar",
		email: "ravi@example.com",
		phone: "+919876543210",
		avatarUrl: null,
		passwordHash: "hashed-password",
		role: "STAFF",
		status: "ACTIVE",
		createdAt: new Date("2026-07-14T10:12:00.000Z"),
		updatedAt: new Date("2026-07-20T08:30:00.000Z"),
	});

	beforeEach(() => {
		staffRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByRestaurantId: jest.fn(),
			findByIdAndRestaurantId: jest.fn(),
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

		useCase = new GetStaffDetailUseCase(staffRepository, restaurantRepository);
	});

	it("should retrieve staff detail successfully and return safe non-sensitive fields", async () => {
		restaurantRepository.findById.mockResolvedValue(dummyRestaurant);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(dummyStaff);

		const result = await useCase.execute({
			restaurantId: "res_01ABC",
			staffId: "stf_02AB",
		});

		expect(restaurantRepository.findById).toHaveBeenCalledWith("res_01ABC");
		expect(staffRepository.findByIdAndRestaurantId).toHaveBeenCalledWith(
			"stf_02AB",
			"res_01ABC",
		);
		expect(result).toEqual({
			id: "stf_02AB",
			restaurantId: "res_01ABC",
			fullname: "Ravi Kumar",
			email: "ravi@example.com",
			phone: "+919876543210",
			avatarUrl: null,
			role: "STAFF",
			status: "ACTIVE",
			createdAt: "2026-07-14T10:12:00.000Z",
			updatedAt: "2026-07-20T08:30:00.000Z",
		});

		// Ensure sensitive fields are never present
		const rawResult = result as unknown as Record<string, unknown>;
		expect(rawResult.password).toBeUndefined();
		expect(rawResult.passwordHash).toBeUndefined();
		expect(rawResult.token).toBeUndefined();
		expect(rawResult.refreshToken).toBeUndefined();
		expect(rawResult.otp).toBeUndefined();
	});

	it("should throw RestaurantNotFoundError when the restaurant does not exist", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: "res_non_existent",
				staffId: "stf_02AB",
			}),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(staffRepository.findByIdAndRestaurantId).not.toHaveBeenCalled();
	});

	it("should throw StaffNotFoundError when staff member does not exist or does not belong to restaurant", async () => {
		restaurantRepository.findById.mockResolvedValue(dummyRestaurant);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: "res_01ABC",
				staffId: "stf_not_found",
			}),
		).rejects.toThrow(StaffNotFoundError);
	});

	it("should throw StaffNotFoundError when the account is not a STAFF account", async () => {
		const nonStaffAccount = RestaurantStaff.reconstitute({
			id: "stf_02AB",
			restaurantId: "res_01ABC",
			fullname: "Ravi Kumar",
			email: "ravi@example.com",
			phone: "+919876543210",
			avatarUrl: null,
			passwordHash: "hashed-password",
			role: "STAFF",
			status: "ACTIVE",
		});
		// Simulate role being modified or different
		Object.defineProperty(nonStaffAccount, "role", {
			get: () => "ADMIN",
		});

		restaurantRepository.findById.mockResolvedValue(dummyRestaurant);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(nonStaffAccount);

		await expect(
			useCase.execute({
				restaurantId: "res_01ABC",
				staffId: "stf_02AB",
			}),
		).rejects.toThrow(StaffNotFoundError);
	});
});
