import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IPasswordHasher } from "@/application/ports/services/password-hasher.port.ts";
import type { ITokenService } from "@/application/ports/services/token-service.port.ts";
import { LoginStaffUseCase } from "@/application/use-cases/staff/login-staff.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	InvalidCredentialsError,
	RestaurantAccountBlockedError,
	RestaurantInactiveError,
	RestaurantNotFoundError,
	StaffInactiveError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

describe("LoginStaffUseCase", () => {
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let passwordHasher: jest.Mocked<IPasswordHasher>;
	let tokenService: jest.Mocked<ITokenService>;
	let useCase: LoginStaffUseCase;

	const mockStaff = RestaurantStaff.create({
		id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		fullname: "Sarah Manager",
		email: "manager@spotq.com",
		phone: "+1234567890",
		passwordHash: "$2b$10$hashedpassword",
		role: "STAFF",
		status: "ACTIVE",
	});

	const mockRestaurant = Restaurant.create({
		id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		ownerName: "John Doe",
		ownerEmail: "owner@spotq.com",
		restaurantName: "SpotQ Diner",
		email: "diner@spotq.com",
		phone: "+1234567890",
		primaryContactNumber: "+1234567890",
		emailVerifiedAt: new Date(),
		onboardingStatus: "COMPLETED",
		isSubscriptionActive: true,
		isBlocked: false,
	});

	beforeEach(() => {
		staffRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByRestaurantId: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
		};

		restaurantRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
			updateSubscription: jest.fn(),
			isRegisteredEmail: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		passwordHasher = {
			hash: jest.fn(),
			compare: jest.fn(),
		};

		tokenService = {
			generateAccessToken: jest.fn(),
			generateRefreshToken: jest.fn(),
			verifyAccessToken: jest.fn(),
			verifyRefreshToken: jest.fn(),
			generateTempToken: jest.fn(),
			verifyTempToken: jest.fn(),
		};

		useCase = new LoginStaffUseCase(
			staffRepository,
			passwordHasher,
			tokenService,
			restaurantRepository,
		);
	});

	it("should authenticate active staff and return staff details and tokens", async () => {
		staffRepository.findByEmail.mockResolvedValue(mockStaff);
		passwordHasher.compare.mockResolvedValue(true);
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		tokenService.generateAccessToken.mockReturnValue("mock-access-token");
		tokenService.generateRefreshToken.mockReturnValue("mock-refresh-token");

		const result = await useCase.execute({
			email: "manager@spotq.com",
			password: "Password@123",
		});

		expect(result.staff.email).toBe("manager@spotq.com");
		expect(result.staff.role).toBe("STAFF");
		expect(result.accessToken).toBe("mock-access-token");
		expect(result.refreshToken).toBe("mock-refresh-token");
		expect(passwordHasher.compare).toHaveBeenCalledWith(
			"Password@123",
			mockStaff.passwordHash,
		);
	});

	it("should throw InvalidCredentialsError if staff email does not exist", async () => {
		staffRepository.findByEmail.mockResolvedValue(null);

		await expect(
			useCase.execute({
				email: "unknown@spotq.com",
				password: "Password@123",
			}),
		).rejects.toThrow(InvalidCredentialsError);
	});

	it("should throw InvalidCredentialsError if password is wrong", async () => {
		staffRepository.findByEmail.mockResolvedValue(mockStaff);
		passwordHasher.compare.mockResolvedValue(false);

		await expect(
			useCase.execute({
				email: "manager@spotq.com",
				password: "WrongPassword",
			}),
		).rejects.toThrow(InvalidCredentialsError);
	});

	it("should throw StaffInactiveError if staff account is inactive", async () => {
		const inactiveStaff = RestaurantStaff.create({
			restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			fullname: "Inactive User",
			email: "inactive@spotq.com",
			phone: "+1234567890",
			passwordHash: "hash",
			status: "INACTIVE",
		});

		staffRepository.findByEmail.mockResolvedValue(inactiveStaff);

		await expect(
			useCase.execute({
				email: "inactive@spotq.com",
				password: "Password@123",
			}),
		).rejects.toThrow(StaffInactiveError);
	});

	it("should throw StaffSuspendedError if staff account is suspended", async () => {
		const suspendedStaff = RestaurantStaff.create({
			restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			fullname: "Suspended User",
			email: "suspended@spotq.com",
			phone: "+1234567890",
			passwordHash: "hash",
			status: "SUSPENDED",
		});

		staffRepository.findByEmail.mockResolvedValue(suspendedStaff);

		await expect(
			useCase.execute({
				email: "suspended@spotq.com",
				password: "Password@123",
			}),
		).rejects.toThrow(StaffSuspendedError);
	});

	it("should throw RestaurantNotFoundError if restaurant does not exist", async () => {
		staffRepository.findByEmail.mockResolvedValue(mockStaff);
		passwordHasher.compare.mockResolvedValue(true);
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				email: "manager@spotq.com",
				password: "Password@123",
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("should throw RestaurantAccountBlockedError if restaurant is blocked", async () => {
		const blockedRestaurant = Restaurant.create({
			id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			ownerName: "John Doe",
			ownerEmail: "owner@spotq.com",
			restaurantName: "SpotQ Diner",
			email: "diner@spotq.com",
			phone: "+1234567890",
			primaryContactNumber: "+1234567890",
			isBlocked: true,
		});

		staffRepository.findByEmail.mockResolvedValue(mockStaff);
		passwordHasher.compare.mockResolvedValue(true);
		restaurantRepository.findById.mockResolvedValue(blockedRestaurant);

		await expect(
			useCase.execute({
				email: "manager@spotq.com",
				password: "Password@123",
			}),
		).rejects.toThrow(RestaurantAccountBlockedError);
	});

	it("should throw RestaurantInactiveError if restaurant subscription is inactive", async () => {
		const inactiveRestaurant = Restaurant.create({
			id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			ownerName: "John Doe",
			ownerEmail: "owner@spotq.com",
			restaurantName: "SpotQ Diner",
			email: "diner@spotq.com",
			phone: "+1234567890",
			primaryContactNumber: "+1234567890",
			emailVerifiedAt: new Date(),
			onboardingStatus: "COMPLETED",
			isSubscriptionActive: false,
		});

		staffRepository.findByEmail.mockResolvedValue(mockStaff);
		passwordHasher.compare.mockResolvedValue(true);
		restaurantRepository.findById.mockResolvedValue(inactiveRestaurant);

		await expect(
			useCase.execute({
				email: "manager@spotq.com",
				password: "Password@123",
			}),
		).rejects.toThrow(RestaurantInactiveError);
	});
});
