import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IStorageService } from "@/application/ports/services/storage.service.port.ts";
import { UpdateStaffProfileUseCase } from "@/application/use-cases/staff/update-staff-profile.use-case.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	InvalidStaffDataError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

describe("UpdateStaffProfileUseCase", () => {
	let staffRepository: jest.Mocked<Required<IRestaurantStaffRepository>>;
	let storageService: {
		generatePresignedGetUrl: jest.Mock<
			() => Promise<{ downloadUrl: string; expiresIn: number }>
		>;
	};
	let useCase: UpdateStaffProfileUseCase;

	const mockRestaurantId = "11111111-1111-1111-1111-111111111111";
	const mockStaffId = "22222222-2222-2222-2222-222222222222";

	const createMockStaff = (
		status = "ACTIVE",
		restaurantId = mockRestaurantId,
	) => {
		return RestaurantStaff.reconstitute({
			id: mockStaffId,
			restaurantId,
			fullname: "Original Name",
			email: "john@spicegarden.com",
			phone: "+919876543210",
			avatarUpdatedAt: null,
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
			findByEmailAndRestaurantId: jest.fn(),
			findByRestaurantId: jest.fn(),
			findManyWithFilters: jest.fn(),
			findByIdAndRestaurantId: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
		};

		storageService = {
			generatePresignedGetUrl:
				jest.fn<() => Promise<{ downloadUrl: string; expiresIn: number }>>(),
		};

		useCase = new UpdateStaffProfileUseCase(
			staffRepository,
			storageService as unknown as IStorageService,
		);
	});

	it("should successfully update staff profile with avatar url directly", async () => {
		const staff = createMockStaff("ACTIVE");
		staffRepository.findById.mockResolvedValue(staff);
		staffRepository.save.mockResolvedValue(undefined);

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
			staffId: mockStaffId,
			fullname: "Updated Name",
			phone: "+919876543211",
			avatarUrl: "https://s3.amazonaws.com/spotq/avatar.png",
		});

		expect(staffRepository.findById).toHaveBeenCalledWith(mockStaffId);
		expect(staffRepository.save).toHaveBeenCalledWith(staff);
		expect(result.fullname).toBe("Updated Name");
		expect(result.phone).toBe("+919876543211");
		expect(storageService.generatePresignedGetUrl).not.toHaveBeenCalled();
		expect(result.avatar_url).toBe("https://s3.amazonaws.com/spotq/avatar.png");
	});

	it("should support removing avatar when hasAvatar is false", async () => {
		const staff = createMockStaff("ACTIVE");
		staff.updateProfile(undefined, undefined, new Date());
		staffRepository.findById.mockResolvedValue(staff);
		staffRepository.save.mockResolvedValue(undefined);

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
			staffId: mockStaffId,
			hasAvatar: false,
		});

		expect(staff.avatarUpdatedAt).toBeNull();
		expect(storageService.generatePresignedGetUrl).not.toHaveBeenCalled();
		expect(result.avatar_url).toBeNull();
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

	it("should allow updating profile when staff membership status is INACTIVE", async () => {
		const staff = createMockStaff("INACTIVE");
		staffRepository.findById.mockResolvedValue(staff);
		staffRepository.save.mockResolvedValue(undefined);

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
			staffId: mockStaffId,
			fullname: "New Name",
		});
		expect(result.fullname).toBe("New Name");
	});

	it("should allow updating profile when staff membership status is SUSPENDED", async () => {
		const staff = createMockStaff("SUSPENDED");
		staffRepository.findById.mockResolvedValue(staff);
		staffRepository.save.mockResolvedValue(undefined);

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
			staffId: mockStaffId,
			fullname: "New Name",
		});
		expect(result.fullname).toBe("New Name");
	});
});
