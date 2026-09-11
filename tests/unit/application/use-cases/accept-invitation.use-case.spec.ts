import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IInvitationTokenService } from "@/application/ports/services/invitation-token.service.port.ts";
import type { IPasswordHasher } from "@/application/ports/services/password-hasher.port.ts";
import type { ITokenService } from "@/application/ports/services/token-service.port.ts";
import { AcceptInvitationUseCase } from "@/application/use-cases/staff/accept-invitation.use-case.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import { StaffInvitation } from "@/domain/entities/staff-invitation.entity.ts";
import {
	InvalidInvitationTokenError,
	InvitationExpiredError,
	StaffAlreadyExistsError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { IStaffInvitationRepository } from "@/domain/repositories/staff-invitation.repository.interface.ts";

describe("AcceptInvitationUseCase", () => {
	let staffInvitationRepository: jest.Mocked<IStaffInvitationRepository>;
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let invitationTokenService: jest.Mocked<IInvitationTokenService>;
	let passwordHasher: jest.Mocked<IPasswordHasher>;
	let tokenService: jest.Mocked<ITokenService>;
	let useCase: AcceptInvitationUseCase;

	beforeEach(() => {
		staffInvitationRepository = {
			findById: jest.fn(),
			findByTokenHash: jest.fn(),
			findByEmail: jest.fn(),
			findPendingByEmailAndRestaurant: jest.fn(),
			findByRestaurantId: jest.fn(),
			findManyWithFilters: jest.fn(),
			createStaffWithInvitation: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
		};

		staffRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByEmailAndRestaurantId: jest.fn(),
			findByRestaurantId: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
		};

		invitationTokenService = {
			generateToken: jest.fn(),
			hashToken: jest
				.fn<(rawToken: string) => string>()
				.mockReturnValue("mock-hash-123"),
		};

		passwordHasher = {
			hash: jest
				.fn<(plain: string) => Promise<string>>()
				.mockResolvedValue("hashed-password-123"),
			compare: jest.fn(),
		};

		tokenService = {
			generateAccessToken: jest
				.fn<() => string>()
				.mockReturnValue("mock-access-token"),
			generateRefreshToken: jest
				.fn<() => string>()
				.mockReturnValue("mock-refresh-token"),
			generateTempToken: jest.fn(),
			verifyAccessToken: jest.fn(),
			verifyRefreshToken: jest.fn(),
			verifyTempToken: jest.fn(),
		};

		useCase = new AcceptInvitationUseCase(
			staffInvitationRepository,
			staffRepository,
			invitationTokenService,
			passwordHasher,
			tokenService,
		);
	});

	it("should create staff, mark invitation accepted, and return tokens on valid acceptance", async () => {
		const invitation = StaffInvitation.create({
			restaurantId: "restaurant-uuid-1",
			email: "john@example.com",
			tokenHash: "mock-hash-123",
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
		});

		staffInvitationRepository.findByTokenHash.mockResolvedValue(invitation);
		staffRepository.findByEmailAndRestaurantId.mockResolvedValue(null);
		staffInvitationRepository.createStaffWithInvitation.mockResolvedValue();

		const result = await useCase.execute({
			token: "raw-token-123",
			fullname: "John Doe",
			phone: "9876543210",
			password: "SecurePassword123!",
		});

		expect(result.staff).toBeDefined();
		expect(result.staff.email).toBe("john@example.com");
		expect(result.staff.fullname).toBe("John Doe");
		expect(result.staff.phone).toBe("+919876543210");
		expect(result.staff.restaurantId).toBe("restaurant-uuid-1");
		expect(result.accessToken).toBe("mock-access-token");
		expect(result.refreshToken).toBe("mock-refresh-token");

		expect(invitation.status).toBe("ACCEPTED");
		expect(invitation.acceptedAt).toBeInstanceOf(Date);
		expect(
			staffInvitationRepository.createStaffWithInvitation,
		).toHaveBeenCalledTimes(1);
	});

	it("should throw InvalidInvitationTokenError if invitation not found", async () => {
		staffInvitationRepository.findByTokenHash.mockResolvedValue(null);

		await expect(
			useCase.execute({
				token: "bad-token",
				fullname: "John Doe",
				phone: "+1234567890",
				password: "SecurePassword123!",
			}),
		).rejects.toThrow(InvalidInvitationTokenError);
	});

	it("should throw InvitationExpiredError if invitation has expired", async () => {
		const expiredInvitation = StaffInvitation.create({
			restaurantId: "restaurant-uuid-1",
			email: "john@example.com",
			tokenHash: "mock-hash-123",
			expiresAt: new Date(Date.now() - 1000),
		});

		staffInvitationRepository.findByTokenHash.mockResolvedValue(
			expiredInvitation,
		);
		staffInvitationRepository.save.mockResolvedValue();

		await expect(
			useCase.execute({
				token: "raw-token",
				fullname: "John Doe",
				phone: "+1234567890",
				password: "SecurePassword123!",
			}),
		).rejects.toThrow(InvitationExpiredError);

		expect(expiredInvitation.status).toBe("EXPIRED");
	});

	it("should throw StaffAlreadyExistsError if email is already registered", async () => {
		const invitation = StaffInvitation.create({
			restaurantId: "restaurant-uuid-1",
			email: "existing@example.com",
			tokenHash: "mock-hash-123",
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
		});

		const existingStaff = RestaurantStaff.create({
			restaurantId: "restaurant-uuid-1",
			fullname: "Existing Staff",
			email: "existing@example.com",
			phone: "+1234567890",
			passwordHash: "hash",
		});

		staffInvitationRepository.findByTokenHash.mockResolvedValue(invitation);
		staffRepository.findByEmailAndRestaurantId.mockResolvedValue(existingStaff);

		await expect(
			useCase.execute({
				token: "raw-token",
				fullname: "John Doe",
				phone: "+1234567890",
				password: "SecurePassword123!",
			}),
		).rejects.toThrow(StaffAlreadyExistsError);
	});
});
