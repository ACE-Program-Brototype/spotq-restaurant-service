import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IPasswordHasher } from "@/application/ports/services/password-hasher.port.ts";
import type { ITokenService } from "@/application/ports/services/token-service.port.ts";
import { ResetPasswordUseCase } from "@/application/use-cases/staff/reset-password.use-case.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	InvalidStaffDataError,
	InvalidTempTokenError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { ITokenRevocationRepository } from "@/domain/repositories/token-revocation.repository.interface.ts";

describe("ResetPasswordUseCase", () => {
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let passwordHasher: jest.Mocked<IPasswordHasher>;
	let tokenService: jest.Mocked<ITokenService>;
	let tokenRevocationRepository: jest.Mocked<ITokenRevocationRepository>;
	let useCase: ResetPasswordUseCase;

	const mockStaff = RestaurantStaff.reconstitute({
		id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		fullname: "Sarah Manager",
		email: "manager@spotq.com",
		phone: "+1234567890",
		avatarUrl: null,
		passwordHash: "oldHashedPassword",
		role: "STAFF",
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
			generateTempToken: jest.fn(),
			verifyTempToken: jest.fn(),
		};

		tokenRevocationRepository = {
			revoke: jest.fn(),
			isRevoked: jest.fn(),
		};

		useCase = new ResetPasswordUseCase(
			staffRepository,
			passwordHasher,
			tokenService,
			tokenRevocationRepository,
		);
	});

	it("should verify tempToken, hash new password, save staff, and revoke tempToken", async () => {
		tokenRevocationRepository.isRevoked.mockResolvedValue(false);
		tokenService.verifyTempToken.mockReturnValue({
			sub: mockStaff.id,
			email: mockStaff.email,
			purpose: "password-reset",
		});
		staffRepository.findById.mockResolvedValue(mockStaff);
		passwordHasher.hash.mockResolvedValue("newHashedPassword");
		staffRepository.save.mockResolvedValue();
		tokenRevocationRepository.revoke.mockResolvedValue();

		await useCase.execute({
			tempToken: "valid-temp-token",
			password: "NewPassword@123",
		});

		expect(tokenRevocationRepository.isRevoked).toHaveBeenCalledWith(
			"valid-temp-token",
		);
		expect(passwordHasher.hash).toHaveBeenCalledWith("NewPassword@123");
		expect(staffRepository.save).toHaveBeenCalled();
		expect(tokenRevocationRepository.revoke).toHaveBeenCalledWith(
			"valid-temp-token",
		);
	});

	it("should throw InvalidTempTokenError when tempToken is missing", async () => {
		await expect(
			useCase.execute({ password: "NewPassword@123" }),
		).rejects.toThrow(InvalidTempTokenError);
	});

	it("should throw InvalidStaffDataError when password is too short", async () => {
		await expect(
			useCase.execute({ tempToken: "valid-temp-token", password: "short" }),
		).rejects.toThrow(InvalidStaffDataError);
	});

	it("should throw InvalidTempTokenError when tempToken is revoked in Redis", async () => {
		tokenRevocationRepository.isRevoked.mockResolvedValue(true);

		await expect(
			useCase.execute({
				tempToken: "revoked-token",
				password: "NewPassword@123",
			}),
		).rejects.toThrow(InvalidTempTokenError);
	});

	it("should throw InvalidTempTokenError when token purpose is not password-reset", async () => {
		tokenRevocationRepository.isRevoked.mockResolvedValue(false);
		tokenService.verifyTempToken.mockReturnValue({
			sub: mockStaff.id,
			email: mockStaff.email,
			purpose: "other-purpose",
		});

		await expect(
			useCase.execute({
				tempToken: "wrong-purpose-token",
				password: "NewPassword@123",
			}),
		).rejects.toThrow(InvalidTempTokenError);
	});

	it("should throw StaffNotFoundError when staff is not found", async () => {
		tokenRevocationRepository.isRevoked.mockResolvedValue(false);
		tokenService.verifyTempToken.mockReturnValue({
			sub: "unknown-id",
			email: "unknown@spotq.com",
			purpose: "password-reset",
		});
		staffRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				tempToken: "valid-temp-token",
				password: "NewPassword@123",
			}),
		).rejects.toThrow(StaffNotFoundError);
	});
});
