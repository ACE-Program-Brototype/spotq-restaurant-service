import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { ITokenService } from "@/application/ports/services/token-service.port.ts";
import { VerifyForgotPasswordOtpUseCase } from "@/application/use-cases/staff/verify-forgot-password-otp.use-case.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	InvalidOtpError,
	OtpExpiredError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IOtpRepository } from "@/domain/repositories/otp.repository.interface.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

describe("VerifyForgotPasswordOtpUseCase", () => {
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let otpRepository: jest.Mocked<IOtpRepository>;
	let tokenService: jest.Mocked<ITokenService>;
	let useCase: VerifyForgotPasswordOtpUseCase;

	const mockStaff = RestaurantStaff.reconstitute({
		id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		fullname: "Sarah Manager",
		email: "manager@spotq.com",
		phone: "+1234567890",
		avatarUrl: null,
		passwordHash: "hashedPassword",
		role: "MANAGER",
		status: "ACTIVE",
		createdAt: new Date(),
		updatedAt: new Date(),
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

		otpRepository = {
			saveOtp: jest.fn(),
			getOtp: jest.fn(),
			verifyOtp: jest.fn(),
			deleteOtp: jest.fn(),
		};

		tokenService = {
			generateAccessToken: jest.fn(),
			generateRefreshToken: jest.fn(),
			verifyAccessToken: jest.fn(),
			verifyRefreshToken: jest.fn(),
			generateTempToken: jest.fn(),
			verifyTempToken: jest.fn(),
		};

		useCase = new VerifyForgotPasswordOtpUseCase(
			staffRepository,
			otpRepository,
			tokenService,
		);
	});

	it("should verify correct OTP, delete OTP from Redis, and return tempToken", async () => {
		staffRepository.findByEmail.mockResolvedValue(mockStaff);
		otpRepository.getOtp.mockResolvedValue("mockHashedOtp");
		otpRepository.verifyOtp.mockResolvedValue(true);
		otpRepository.deleteOtp.mockResolvedValue();
		tokenService.generateTempToken.mockReturnValue("mock-temp-token");

		const result = await useCase.execute({
			email: "manager@spotq.com",
			otp: "123456",
		});

		expect(result).toEqual({ tempToken: "mock-temp-token" });
		expect(otpRepository.verifyOtp).toHaveBeenCalledWith(
			"manager@spotq.com",
			"123456",
		);
		expect(otpRepository.deleteOtp).toHaveBeenCalledWith("manager@spotq.com");
		expect(tokenService.generateTempToken).toHaveBeenCalledWith({
			id: mockStaff.id,
			email: mockStaff.email,
			purpose: "password-reset",
		});
	});

	it("should throw StaffNotFoundError if email is not found", async () => {
		staffRepository.findByEmail.mockResolvedValue(null);

		await expect(
			useCase.execute({ email: "unknown@spotq.com", otp: "123456" }),
		).rejects.toThrow(StaffNotFoundError);
	});

	it("should throw OtpExpiredError if OTP is not found in Redis", async () => {
		staffRepository.findByEmail.mockResolvedValue(mockStaff);
		otpRepository.getOtp.mockResolvedValue(null);

		await expect(
			useCase.execute({ email: "manager@spotq.com", otp: "123456" }),
		).rejects.toThrow(OtpExpiredError);
	});

	it("should throw InvalidOtpError if verifyOtp returns false", async () => {
		staffRepository.findByEmail.mockResolvedValue(mockStaff);
		otpRepository.getOtp.mockResolvedValue("mockHashedOtp");
		otpRepository.verifyOtp.mockResolvedValue(false);

		await expect(
			useCase.execute({ email: "manager@spotq.com", otp: "123456" }),
		).rejects.toThrow(InvalidOtpError);
	});
});
