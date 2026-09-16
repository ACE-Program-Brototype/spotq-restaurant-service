import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { UpdateStaffInfoUseCase } from "@/application/use-cases/staff/update-staff-info.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	InvalidPhoneError,
	InvalidStaffDataError,
	RestaurantNotFoundError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

describe("UpdateStaffInfoUseCase", () => {
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let useCase: UpdateStaffInfoUseCase;

	const mockRestaurantId = "res-uuid-1234";
	const mockStaffId = "staff-uuid-5678";

	const mockRestaurant = Restaurant.create({
		id: mockRestaurantId,
		restaurantName: "Spice Garden",
		email: "owner@spicegarden.com",
		phone: "+919876543210",
		ownerName: "Owner Name",
		ownerEmail: "owner@spicegarden.com",
		status: "ACTIVE",
	});

	const mockStaff = RestaurantStaff.create({
		id: mockStaffId,
		restaurantId: mockRestaurantId,
		fullname: "Old Staff Name",
		email: "staff@spicegarden.com",
		phone: "+919876543210",
		passwordHash: "hashed_password",
		role: "STAFF",
		status: "ACTIVE",
	});

	beforeEach(() => {
		staffRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByRestaurantId: jest.fn(),
			findByIdAndRestaurantId: jest.fn(),
			updateStaffInfo: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
		};

		restaurantRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			existsByEmail: jest.fn(),
			create: jest.fn(),
			findUnique: jest.fn(),
			find: jest.fn(),
			update: jest.fn(),
			createRestaurant: jest.fn(),
		};

		useCase = new UpdateStaffInfoUseCase(staffRepository, restaurantRepository);
	});

	it("should update staff name successfully", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(mockStaff);

		const updatedStaff = RestaurantStaff.reconstitute({
			id: mockStaffId,
			restaurantId: mockRestaurantId,
			fullname: "Ravi Kumar",
			email: mockStaff.email,
			phone: mockStaff.phone,
			avatarUrl: null,
			role: "STAFF",
			status: "ACTIVE",
			updatedAt: new Date(),
		});
		staffRepository.updateStaffInfo.mockResolvedValue(updatedStaff);

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
			staffId: mockStaffId,
			fullname: "Ravi Kumar",
		});

		expect(result).toEqual({
			id: mockStaffId,
			restaurant_id: mockRestaurantId,
			fullname: "Ravi Kumar",
			email: mockStaff.email,
			phone: "+919876543210",
			avatar_url: null,
			role: "STAFF",
			status: "ACTIVE",
			created_at: expect.any(String),
			updated_at: expect.any(String),
		});
		expect(staffRepository.updateStaffInfo).toHaveBeenCalledWith(mockStaffId, {
			fullname: "Ravi Kumar",
			phone: undefined,
		});
	});

	it("should update staff phone with normalization successfully", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(mockStaff);

		const updatedStaff = RestaurantStaff.reconstitute({
			id: mockStaffId,
			restaurantId: mockRestaurantId,
			fullname: mockStaff.fullname,
			email: mockStaff.email,
			phone: "+919988776655",
			avatarUrl: null,
			role: "STAFF",
			status: "ACTIVE",
			updatedAt: new Date(),
		});
		staffRepository.updateStaffInfo.mockResolvedValue(updatedStaff);

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
			staffId: mockStaffId,
			phone: "9988776655",
		});

		expect(result.phone).toBe("+919988776655");
		expect(staffRepository.updateStaffInfo).toHaveBeenCalledWith(mockStaffId, {
			fullname: undefined,
			phone: "+919988776655",
		});
	});

	it("should update both name and phone successfully", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(mockStaff);

		const updatedStaff = RestaurantStaff.reconstitute({
			id: mockStaffId,
			restaurantId: mockRestaurantId,
			fullname: "Ravi Kumar",
			email: mockStaff.email,
			phone: "+919876543210",
			avatarUrl: null,
			role: "STAFF",
			status: "ACTIVE",
			updatedAt: new Date(),
		});
		staffRepository.updateStaffInfo.mockResolvedValue(updatedStaff);

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
			staffId: mockStaffId,
			fullname: "  Ravi Kumar  ",
			phone: "+919876543210",
		});

		expect(result.fullname).toBe("Ravi Kumar");
		expect(result.phone).toBe("+919876543210");
		expect(staffRepository.updateStaffInfo).toHaveBeenCalledWith(mockStaffId, {
			fullname: "Ravi Kumar",
			phone: "+919876543210",
		});
	});

	it("should throw InvalidStaffDataError when neither name nor phone is provided", async () => {
		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
			}),
		).rejects.toThrow(InvalidStaffDataError);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-res",
				staffId: mockStaffId,
				fullname: "Ravi Kumar",
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("should throw StaffNotFoundError when staff member does not exist in restaurant", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: "non-existent-staff",
				fullname: "Ravi Kumar",
			}),
		).rejects.toThrow(StaffNotFoundError);
	});

	it("should throw StaffNotFoundError when account is not a staff role", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);

		const nonStaffEntity = {
			...mockStaff,
			role: "ADMIN",
		} as unknown as RestaurantStaff;
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(nonStaffEntity);

		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
				fullname: "Ravi Kumar",
			}),
		).rejects.toThrow(StaffNotFoundError);
	});

	it("should throw InvalidStaffDataError when name is less than 2 characters", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(mockStaff);

		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
				fullname: " A ",
			}),
		).rejects.toThrow(InvalidStaffDataError);
	});

	it("should throw InvalidPhoneError when phone number format is invalid", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(mockStaff);

		await expect(
			useCase.execute({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
				phone: "12345",
			}),
		).rejects.toThrow(InvalidPhoneError);
	});
});
