import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type {
	ITokenService,
	StaffTokenPayload,
} from "@/application/ports/services/token-service.port.ts";
import { RefreshTokenUseCase } from "@/application/use-cases/staff/refresh-token.use-case.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	InvalidRefreshTokenError,
	RevokedTokenError,
	StaffInactiveError,
	StaffNotFoundError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { ITokenRevocationRepository } from "@/domain/repositories/token-revocation.repository.interface.ts";

describe("RefreshTokenUseCase", () => {
	let tokenService: jest.Mocked<ITokenService>;
	let restaurantStaffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let tokenRevocationRepository: jest.Mocked<ITokenRevocationRepository>;
	let useCase: RefreshTokenUseCase;

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

	const mockPayload: StaffTokenPayload = {
		id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		email: "manager@spotq.com",
		role: "MANAGER",
	};

	beforeEach(() => {
		tokenService = {
			generateAccessToken: jest.fn(),
			generateRefreshToken: jest.fn(),
			verifyAccessToken: jest.fn(),
			verifyRefreshToken: jest.fn(),
			generateTempToken: jest.fn(),
			verifyTempToken: jest.fn(),
		};

		restaurantStaffRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByRestaurantId: jest.fn(),
			save: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		};

		tokenRevocationRepository = {
			revoke: jest.fn(),
			isRevoked: jest.fn(),
		};

		useCase = new RefreshTokenUseCase(
			tokenService,
			restaurantStaffRepository,
			tokenRevocationRepository,
		);
	});

	it("should return new accessToken on valid refreshToken", async () => {
		tokenRevocationRepository.isRevoked.mockResolvedValue(false);
		tokenService.verifyRefreshToken.mockReturnValue(mockPayload);
		restaurantStaffRepository.findById.mockResolvedValue(mockStaff);
		tokenService.generateAccessToken.mockReturnValue("new-access-token");

		const result = await useCase.execute({
			refreshToken: "valid-refresh-token",
		});

		expect(result).toEqual({ accessToken: "new-access-token" });
		expect(tokenRevocationRepository.isRevoked).toHaveBeenCalledWith(
			"valid-refresh-token",
		);
		expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(
			"valid-refresh-token",
		);
		expect(restaurantStaffRepository.findById).toHaveBeenCalledWith(
			mockPayload.id,
		);
	});

	it("should throw InvalidRefreshTokenError when token is missing", async () => {
		await expect(useCase.execute({})).rejects.toThrow(InvalidRefreshTokenError);
	});

	it("should throw RevokedTokenError when token is blacklisted in Redis", async () => {
		tokenRevocationRepository.isRevoked.mockResolvedValue(true);

		await expect(
			useCase.execute({ refreshToken: "revoked-token" }),
		).rejects.toThrow(RevokedTokenError);
	});

	it("should throw InvalidRefreshTokenError when JWT verification fails", async () => {
		tokenRevocationRepository.isRevoked.mockResolvedValue(false);
		tokenService.verifyRefreshToken.mockImplementation(() => {
			throw new Error("jwt expired");
		});

		await expect(
			useCase.execute({ refreshToken: "expired-token" }),
		).rejects.toThrow(InvalidRefreshTokenError);
	});

	it("should throw StaffNotFoundError when staff is not found in database", async () => {
		tokenRevocationRepository.isRevoked.mockResolvedValue(false);
		tokenService.verifyRefreshToken.mockReturnValue(mockPayload);
		restaurantStaffRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({ refreshToken: "valid-token" }),
		).rejects.toThrow(StaffNotFoundError);
	});

	it("should throw StaffInactiveError when staff status is INACTIVE", async () => {
		const inactiveStaff = RestaurantStaff.reconstitute({
			id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			fullname: "Sarah Manager",
			email: "manager@spotq.com",
			phone: "+1234567890",
			avatarUrl: null,
			passwordHash: "hashedPassword",
			role: "MANAGER",
			status: "INACTIVE",
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		tokenRevocationRepository.isRevoked.mockResolvedValue(false);
		tokenService.verifyRefreshToken.mockReturnValue(mockPayload);
		restaurantStaffRepository.findById.mockResolvedValue(inactiveStaff);

		await expect(
			useCase.execute({ refreshToken: "valid-token" }),
		).rejects.toThrow(StaffInactiveError);
	});

	it("should throw StaffSuspendedError when staff status is SUSPENDED", async () => {
		const suspendedStaff = RestaurantStaff.reconstitute({
			id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			fullname: "Sarah Manager",
			email: "manager@spotq.com",
			phone: "+1234567890",
			avatarUrl: null,
			passwordHash: "hashedPassword",
			role: "MANAGER",
			status: "SUSPENDED",
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		tokenRevocationRepository.isRevoked.mockResolvedValue(false);
		tokenService.verifyRefreshToken.mockReturnValue(mockPayload);
		restaurantStaffRepository.findById.mockResolvedValue(suspendedStaff);

		await expect(
			useCase.execute({ refreshToken: "valid-token" }),
		).rejects.toThrow(StaffSuspendedError);
	});
});
