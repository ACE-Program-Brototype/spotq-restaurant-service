import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IInvitationTokenService } from "@/application/ports/services/invitation-token.service.port.ts";
import { ValidateInvitationUseCase } from "@/application/use-cases/staff/validate-invitation.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { StaffInvitation } from "@/domain/entities/staff-invitation.entity.ts";
import {
	InvalidInvitationTokenError,
	InvitationExpiredError,
} from "@/domain/errors/staff.errors.ts";
import type { IStaffInvitationRepository } from "@/domain/repositories/staff-invitation.repository.interface.ts";

describe("ValidateInvitationUseCase", () => {
	let staffInvitationRepository: jest.Mocked<IStaffInvitationRepository>;
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let invitationTokenService: jest.Mocked<IInvitationTokenService>;
	let useCase: ValidateInvitationUseCase;

	const mockRestaurant = Restaurant.create({
		restaurantName: "Tasty Bites",
		email: "owner@tastybites.com",
		phone: "+1234567890",
		ownerName: "John Owner",
		ownerEmail: "owner@tastybites.com",
	});

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

		restaurantRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			find: jest.fn(),
			findUnique: jest.fn(),
			existsByEmail: jest.fn(),
			create: jest.fn(),
			createRestaurant: jest.fn(),
			update: jest.fn(),
			findManyWithFilters: jest.fn(),
		};

		invitationTokenService = {
			generateToken: jest.fn(),
			hashToken: jest
				.fn<(rawToken: string) => string>()
				.mockReturnValue("hashed-token-123"),
		};

		useCase = new ValidateInvitationUseCase(
			staffInvitationRepository,
			restaurantRepository,
			invitationTokenService,
		);
	});

	it("should return valid: true with email and restaurant name when token is valid and pending", async () => {
		const invitation = StaffInvitation.create({
			restaurantId: mockRestaurant.id,
			email: "staff@tastybites.com",
			tokenHash: "hashed-token-123",
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
		});

		staffInvitationRepository.findByTokenHash.mockResolvedValue(invitation);
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);

		const result = await useCase.execute({ token: "raw-token-123" });

		expect(result).toEqual({
			valid: true,
			email: "staff@tastybites.com",
			restaurantName: "Tasty Bites",
		});
		expect(invitationTokenService.hashToken).toHaveBeenCalledWith(
			"raw-token-123",
		);
	});

	it("should throw InvalidInvitationTokenError if invitation does not exist", async () => {
		staffInvitationRepository.findByTokenHash.mockResolvedValue(null);

		await expect(useCase.execute({ token: "invalid-token" })).rejects.toThrow(
			InvalidInvitationTokenError,
		);
	});

	it("should throw InvalidInvitationTokenError if invitation is not PENDING", async () => {
		const invitation = StaffInvitation.create({
			restaurantId: mockRestaurant.id,
			email: "staff@tastybites.com",
			tokenHash: "hashed-token-123",
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
		});
		invitation.accept();

		staffInvitationRepository.findByTokenHash.mockResolvedValue(invitation);

		await expect(useCase.execute({ token: "raw-token-123" })).rejects.toThrow(
			InvalidInvitationTokenError,
		);
	});

	it("should throw InvitationExpiredError and mark invitation as expired if expired", async () => {
		const expiredInvitation = StaffInvitation.create({
			restaurantId: mockRestaurant.id,
			email: "staff@tastybites.com",
			tokenHash: "hashed-token-123",
			expiresAt: new Date(Date.now() - 1000),
		});

		staffInvitationRepository.findByTokenHash.mockResolvedValue(
			expiredInvitation,
		);
		staffInvitationRepository.save.mockResolvedValue();

		await expect(useCase.execute({ token: "raw-token-123" })).rejects.toThrow(
			InvitationExpiredError,
		);

		expect(expiredInvitation.status).toBe("EXPIRED");
		expect(staffInvitationRepository.save).toHaveBeenCalledWith(
			expiredInvitation,
		);
	});
});
