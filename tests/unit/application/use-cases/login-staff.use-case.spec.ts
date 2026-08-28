import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IPasswordHasher } from "@/application/ports/services/password-hasher.port.ts";
import type { ITokenService } from "@/application/ports/services/token-service.port.ts";
import { LoginStaffUseCase } from "@/application/use-cases/staff/login-staff.use-case.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	InvalidCredentialsError,
	StaffInactiveError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

describe("LoginStaffUseCase", () => {
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
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
		role: "MANAGER",
		status: "ACTIVE",
	});

	beforeEach(() => {
		staffRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByRestaurantId: jest.fn(),
			save: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		};

		passwordHasher = {
			hash: jest.fn(),
			compare: jest.fn(),
		};

		tokenService = {
			generateAccessToken: jest.fn(),
			generateRefreshToken: jest.fn(),
			verifyAccessToken: jest.fn(),
			verifyRefreshToken: jest.fn(),
		};

		useCase = new LoginStaffUseCase(
			staffRepository,
			passwordHasher,
			tokenService,
		);
	});

	it("should authenticate active staff and return staff details and tokens", async () => {
		staffRepository.findByEmail.mockResolvedValue(mockStaff);
		passwordHasher.compare.mockResolvedValue(true);
		tokenService.generateAccessToken.mockReturnValue("mock-access-token");
		tokenService.generateRefreshToken.mockReturnValue("mock-refresh-token");

		const result = await useCase.execute({
			email: "manager@spotq.com",
			password: "Password@123",
		});

		expect(result.staff.email).toBe("manager@spotq.com");
		expect(result.staff.role).toBe("MANAGER");
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
});
