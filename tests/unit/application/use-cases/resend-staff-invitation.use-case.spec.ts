import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IStaffInvitationConfig } from "@/application/ports/config/staff-invitation-config.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IEmailQueuePort } from "@/application/ports/services/email-queue.port.ts";
import type {
	GeneratedInvitationToken,
	IInvitationTokenService,
} from "@/application/ports/services/invitation-token.service.port.ts";
import { ResendStaffInvitationUseCase } from "@/application/use-cases/staff/resend-staff-invitation.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { StaffInvitation } from "@/domain/entities/staff-invitation.entity.ts";
import {
	RestaurantAccountBlockedError,
	RestaurantInactiveError,
	RestaurantNotFoundError,
	StaffInvitationNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { IStaffInvitationRepository } from "@/domain/repositories/staff-invitation.repository.interface.ts";

describe("ResendStaffInvitationUseCase", () => {
	let staffInvitationRepository: jest.Mocked<IStaffInvitationRepository>;
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let emailQueuePort: jest.Mocked<IEmailQueuePort>;
	let invitationTokenService: jest.Mocked<IInvitationTokenService>;
	let mockConfig: IStaffInvitationConfig;
	let useCase: ResendStaffInvitationUseCase;

	const mockRestaurant = Restaurant.create({
		restaurantName: "Tasty Bites",
		email: "owner@tastybites.com",
		phone: "+1234567890",
		ownerName: "John Owner",
		ownerEmail: "owner@tastybites.com",
		status: "ACTIVE",
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
			find: jest.fn(),
			findUnique: jest.fn(),
			existsByEmail: jest.fn(),
			create: jest.fn(),
			createRestaurant: jest.fn(),
			update: jest.fn(),
			completeOnboarding: jest.fn(),
		};

		emailQueuePort = {
			sendVerificationOtp: jest.fn(),
			sendStaffInvitation: jest.fn(),
		};

		invitationTokenService = {
			generateToken: jest.fn<() => GeneratedInvitationToken>().mockReturnValue({
				rawToken: "new-raw-token",
				tokenHash: "new-token-hash",
			}),
			hashToken: jest.fn(),
		};

		mockConfig = {
			tokenTtlHours: 48,
			frontendUrl: "http://localhost:3000",
			invitationAcceptPath: "/invitations/accept",
		};

		useCase = new ResendStaffInvitationUseCase(
			staffInvitationRepository,
			staffRepository,
			restaurantRepository,
			emailQueuePort,
			invitationTokenService,
			mockConfig,
		);
	});

	it("should renew invitation and resend email", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByEmail.mockResolvedValue(null);

		const existingInvitation = StaffInvitation.create({
			restaurantId: mockRestaurant.id,
			email: "staff@tastybites.com",
			tokenHash: "old-token-hash",
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
		});

		staffInvitationRepository.findPendingByEmailAndRestaurant.mockResolvedValue(
			existingInvitation,
		);
		staffInvitationRepository.save.mockResolvedValue();
		emailQueuePort.sendStaffInvitation.mockResolvedValue();

		const result = await useCase.execute({
			restaurantId: mockRestaurant.id,
			email: "staff@tastybites.com",
		});

		expect(result.email).toBe("staff@tastybites.com");
		expect(existingInvitation.tokenHash).toBe("new-token-hash");
		expect(staffInvitationRepository.save).toHaveBeenCalledWith(
			existingInvitation,
		);
		expect(emailQueuePort.sendStaffInvitation).toHaveBeenCalledTimes(1);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: "nonexistent",
				email: "staff@tastybites.com",
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("should throw RestaurantAccountBlockedError when restaurant is blocked", async () => {
		const blockedRestaurant = Restaurant.create({
			restaurantName: "Blocked Bistro",
			email: "blocked@bistro.com",
			phone: "+1234567890",
			ownerName: "Blocked Owner",
			ownerEmail: "blocked@bistro.com",
			status: "ACTIVE",
			isBlocked: true,
		});
		restaurantRepository.findById.mockResolvedValue(blockedRestaurant);

		await expect(
			useCase.execute({
				restaurantId: blockedRestaurant.id,
				email: "staff@tastybites.com",
			}),
		).rejects.toThrow(RestaurantAccountBlockedError);
	});

	it("should throw RestaurantInactiveError when restaurant status is not ACTIVE or APPROVED", async () => {
		const suspendedRestaurant = Restaurant.create({
			restaurantName: "Suspended Bistro",
			email: "suspended@bistro.com",
			phone: "+1234567890",
			ownerName: "Suspended Owner",
			ownerEmail: "suspended@bistro.com",
			status: "SUSPENDED",
		});
		restaurantRepository.findById.mockResolvedValue(suspendedRestaurant);

		await expect(
			useCase.execute({
				restaurantId: suspendedRestaurant.id,
				email: "staff@tastybites.com",
			}),
		).rejects.toThrow(RestaurantInactiveError);
	});

	it("should ignore already accepted invitations and throw StaffInvitationNotFoundError if no renewable invitation exists", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByEmail.mockResolvedValue(null);
		staffInvitationRepository.findPendingByEmailAndRestaurant.mockResolvedValue(
			null,
		);

		const acceptedInvitation = StaffInvitation.create({
			restaurantId: mockRestaurant.id,
			email: "staff@tastybites.com",
			tokenHash: "accepted-token-hash",
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
		});
		acceptedInvitation.accept();

		staffInvitationRepository.findByEmail.mockResolvedValue([
			acceptedInvitation,
		]);

		await expect(
			useCase.execute({
				restaurantId: mockRestaurant.id,
				email: "staff@tastybites.com",
			}),
		).rejects.toThrow(StaffInvitationNotFoundError);
	});
});
