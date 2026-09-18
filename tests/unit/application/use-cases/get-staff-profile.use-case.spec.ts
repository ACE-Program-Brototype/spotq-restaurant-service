import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IStorageService } from "@/application/ports/services/storage.service.port.ts";
import { GetStaffProfileUseCase } from "@/application/use-cases/staff/get-staff-profile.use-case.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	StaffInactiveError,
	StaffNotFoundError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

describe("GetStaffProfileUseCase", () => {
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let storageService: {
		generatePresignedGetUrl: jest.Mock<
			() => Promise<{ downloadUrl: string; expiresIn: number }>
		>;
	};
	let useCase: GetStaffProfileUseCase;

	const dummyStaffWithAvatar = RestaurantStaff.reconstitute({
		id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		fullname: "John Doe",
		email: "john.doe@spiceroute.com",
		phone: "+919876543210",
		avatarUpdatedAt: new Date("2026-01-01T12:00:00.000Z"),
		role: "STAFF",
		status: "ACTIVE",
		createdAt: new Date("2026-01-01T12:00:00.000Z"),
		updatedAt: new Date("2026-01-01T12:00:00.000Z"),
	});

	const dummyStaffWithoutAvatar = RestaurantStaff.reconstitute({
		id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		fullname: "John Doe",
		email: "john.doe@spiceroute.com",
		phone: "+919876543210",
		avatarUpdatedAt: null,
		role: "STAFF",
		status: "ACTIVE",
		createdAt: new Date("2026-01-01T12:00:00.000Z"),
		updatedAt: new Date("2026-01-01T12:00:00.000Z"),
	});

	beforeEach(() => {
		staffRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByEmailAndRestaurantId: jest.fn(),
			findByRestaurantId: jest.fn(),
			findManyWithFilters: jest.fn(),
			findByIdAndRestaurantId: jest.fn(),
			updateStaffInfo: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantStaffRepository>;

		storageService = {
			generatePresignedGetUrl:
				jest.fn<() => Promise<{ downloadUrl: string; expiresIn: number }>>(),
		};

		useCase = new GetStaffProfileUseCase(
			staffRepository,
			storageService as unknown as IStorageService,
		);
	});

	it("should retrieve staff profile and presign avatar url when avatarUpdatedAt is set", async () => {
		staffRepository.findById.mockResolvedValue(dummyStaffWithAvatar);
		storageService.generatePresignedGetUrl.mockResolvedValue({
			downloadUrl:
				"https://s3.amazonaws.com/spotq/restaurants/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/staff/b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01/avatar.png?token=xyz",
			expiresIn: 3600,
		});

		const result = await useCase.execute({
			staffId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		});

		expect(staffRepository.findById).toHaveBeenCalledWith(
			"b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		);
		expect(storageService.generatePresignedGetUrl).toHaveBeenCalledWith({
			key: "restaurants/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/staff/b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01/avatar.png",
		});
		expect(result).toEqual({
			id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			restaurant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			fullname: "John Doe",
			email: "john.doe@spiceroute.com",
			phone: "+919876543210",
			avatar_url:
				"https://s3.amazonaws.com/spotq/restaurants/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/staff/b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01/avatar.png?token=xyz",
			role: "STAFF",
			status: "ACTIVE",
			created_at: "2026-01-01T12:00:00.000Z",
		});
		// Ensure password_hash and internal updated_at are not exposed
		expect(
			(result as unknown as Record<string, unknown>).password_hash,
		).toBeUndefined();
		expect(
			(result as unknown as Record<string, unknown>).passwordHash,
		).toBeUndefined();
		expect(
			(result as unknown as Record<string, unknown>).updated_at,
		).toBeUndefined();
	});

	it("should not call storageService and return avatar_url null when avatarUpdatedAt is null", async () => {
		staffRepository.findById.mockResolvedValue(dummyStaffWithoutAvatar);

		const result = await useCase.execute({
			staffId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		});

		expect(storageService.generatePresignedGetUrl).not.toHaveBeenCalled();
		expect(result.avatar_url).toBeNull();
	});

	it("should throw StaffNotFoundError when staff record does not exist", async () => {
		staffRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({ staffId: "non-existent-id" }),
		).rejects.toThrow(StaffNotFoundError);
	});

	it("should throw StaffNotFoundError when staffId is empty", async () => {
		await expect(useCase.execute({ staffId: "" })).rejects.toThrow(
			StaffNotFoundError,
		);
		expect(staffRepository.findById).not.toHaveBeenCalled();
	});

	it("should propagate unexpected database errors", async () => {
		staffRepository.findById.mockRejectedValue(
			new Error("Database connection lost"),
		);

		await expect(
			useCase.execute({ staffId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01" }),
		).rejects.toThrow("Database connection lost");
	});

	it("should throw StaffInactiveError when staff status is INACTIVE", async () => {
		const inactiveStaff = RestaurantStaff.reconstitute({
			id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			fullname: "John Doe",
			email: "john.doe@spiceroute.com",
			phone: "+919876543210",
			avatarUrl: null,
			role: "STAFF",
			status: "INACTIVE",
		});
		staffRepository.findById.mockResolvedValue(inactiveStaff);

		await expect(
			useCase.execute({ staffId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01" }),
		).rejects.toThrow(StaffInactiveError);
	});

	it("should throw StaffSuspendedError when staff status is SUSPENDED", async () => {
		const suspendedStaff = RestaurantStaff.reconstitute({
			id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			fullname: "John Doe",
			email: "john.doe@spiceroute.com",
			phone: "+919876543210",
			avatarUrl: null,
			role: "STAFF",
			status: "SUSPENDED",
		});
		staffRepository.findById.mockResolvedValue(suspendedStaff);

		await expect(
			useCase.execute({ staffId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01" }),
		).rejects.toThrow(StaffSuspendedError);
	});
});
