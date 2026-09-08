import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GetStaffProfileUseCase } from "@/application/use-cases/staff/get-staff-profile.use-case.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import { StaffNotFoundError } from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

describe("GetStaffProfileUseCase", () => {
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let useCase: GetStaffProfileUseCase;

	const dummyStaff = RestaurantStaff.reconstitute({
		id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		fullname: "John Doe",
		email: "john.doe@spiceroute.com",
		phone: "+919876543210",
		avatarUrl: "restaurants/uuid/staff/uuid_avatar.jpg",
		role: "STAFF",
		status: "ACTIVE",
		createdAt: new Date("2026-01-01T12:00:00.000Z"),
		updatedAt: new Date("2026-01-01T12:00:00.000Z"),
	});

	beforeEach(() => {
		staffRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByRestaurantId: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
		};

		useCase = new GetStaffProfileUseCase(staffRepository);
	});

	it("should retrieve staff profile successfully and return DTO matching contract including created_at", async () => {
		staffRepository.findById.mockResolvedValue(dummyStaff);

		const result = await useCase.execute({
			staffId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		});

		expect(staffRepository.findById).toHaveBeenCalledWith(
			"b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		);
		expect(result).toEqual({
			id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			restaurant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			fullname: "John Doe",
			email: "john.doe@spiceroute.com",
			phone: "+919876543210",
			avatar_url: "restaurants/uuid/staff/uuid_avatar.jpg",
			role: "STAFF",
			status: "ACTIVE",
			created_at: "2026-01-01T12:00:00.000Z",
		});
		// Ensure password_hash and internal updated_at are not exposed
		expect((result as Record<string, unknown>).password_hash).toBeUndefined();
		expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
		expect((result as Record<string, unknown>).updated_at).toBeUndefined();
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
});
