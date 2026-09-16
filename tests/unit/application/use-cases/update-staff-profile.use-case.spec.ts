import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { UpdateStaffProfileUseCase } from "@/application/use-cases/staff/update-staff-profile.use-case.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	InvalidStaffDataError,
	StaffForbiddenError,
	StaffInactiveError,
	StaffNotFoundError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

describe("UpdateStaffProfileUseCase", () => {
	let staffRepository: jest.Mocked<Required<IRestaurantStaffRepository>>;
	let useCase: UpdateStaffProfileUseCase;

	const mockRestaurantId = "11111111-1111-1111-1111-111111111111";
	const mockStaffId = "22222222-2222-2222-2222-222222222222";

	const createMockStaff = (status = "ACTIVE", restaurantId = mockRestaurantId) => {
		return RestaurantStaff.reconstitute({
			id: mockStaffId,
			restaurantId,
			fullname: "Original Name",
			email: "john@spicegarden.com",
			phone: "+919876543210",
			avatarUrl: null,
			passwordHash: "hash",
			role: "STAFF",
			status,
			createdAt: new Date("2026-09-01T10:00:00Z"),
			updatedAt: new Date("2026-09-01T10:00:00Z"),
		});
	};

	beforeEach(() => {
		staffRepository = {
			findById: jest.fn(),
			exists: jest.fn(),
			findByEmail: jest.fn(),
			findByRestaurantId: jest.fn(),
			findByIdAndRestaurantId: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
		};

		useCase = new UpdateStaffProfileUseCase(staffRepository);
	});

	it("should successfully update staff profile with valid data", async () => {
		const staff = createMockStaff("ACTIVE");
		staffRepository.findById.mockResolvedValue(staff);
		staffRepository.save.mockResolvedValue(undefined);

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
			staffId: mockStaffId,
			fullname: "Updated Name",
			phone: "+919876543211",
			avatarUrl: `restaurants/${mockRestaurantId}/staff/${mockStaffId}/avatar/new.png`,
		});

		expect(staffRepository.findById).toHaveBeenCalledWith(mockStaffId);
		expect(staffRepository.save).toHaveBeenCalledWith(staff);
		expect(result.fullname).toBe("Updated Name");
		expect(result.phone).toBe("+919876543211");
		expect(result.avatar_url).toBe(
			`restaurants/${mockRestaurantId}/staff/${mockStaffId}/avatar/new.png`,
		);
	});

	it("should throw InvalidStaffDataError when no editable fields are provided", async () => {
		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
			}),
		).rejects.toThrow(InvalidStaffDataError);

		expect(staffRepository.findById).not.toHaveBeenCalled();
	});

	it("should throw StaffNotFoundError when staff is not found", async () => {
		staffRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
				fullname: "New Name",
			}),
		).rejects.toThrow(StaffNotFoundError);
	});

	it("should throw StaffInactiveError when staff account is INACTIVE", async () => {
		const staff = createMockStaff("INACTIVE");
		staffRepository.findById.mockResolvedValue(staff);

		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
				fullname: "New Name",
			}),
		).rejects.toThrow(StaffInactiveError);
	});

	it("should throw StaffSuspendedError when staff account is SUSPENDED", async () => {
		const staff = createMockStaff("SUSPENDED");
		staffRepository.findById.mockResolvedValue(staff);

		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
				fullname: "New Name",
			}),
		).rejects.toThrow(StaffSuspendedError);
	});

	it("should throw StaffForbiddenError when staff belongs to a different restaurant", async () => {
		const staff = createMockStaff("ACTIVE", "other-restaurant-id");
		staffRepository.findById.mockResolvedValue(staff);

		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
				fullname: "New Name",
			}),
		).rejects.toThrow(StaffForbiddenError);
	});

	it("should throw StaffForbiddenError when avatar key belongs to another restaurant", async () => {
		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
				avatarUrl: `restaurants/other-res/staff/${mockStaffId}/avatar.png`,
			}),
		).rejects.toThrow(StaffForbiddenError);

		expect(staffRepository.findById).not.toHaveBeenCalled();
	});

	it("should throw StaffForbiddenError when avatar key belongs to another staff member", async () => {
		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
				avatarUrl: `restaurants/${mockRestaurantId}/staff/other-staff/avatar.png`,
			}),
		).rejects.toThrow(StaffForbiddenError);

		expect(staffRepository.findById).not.toHaveBeenCalled();
	});
});
