import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IStaffInvitationConfig } from "@/application/ports/config/staff-invitation-config.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IEmailQueuePort } from "@/application/ports/services/email-queue.port.ts";
import type {
	GeneratedInvitationToken,
	IInvitationTokenService,
} from "@/application/ports/services/invitation-token.service.port.ts";
import { InviteStaffUseCase } from "@/application/use-cases/staff/invite-staff.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import { StaffInvitation } from "@/domain/entities/staff-invitation.entity.ts";
import {
	RestaurantAccountBlockedError,
	RestaurantInactiveError,
	RestaurantNotFoundError,
	StaffAlreadyExistsError,
	StaffInvitationAlreadyPendingError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { IStaffInvitationRepository } from "@/domain/repositories/staff-invitation.repository.interface.ts";

describe("InviteStaffUseCase", () => {
	let staffInvitationRepository: jest.Mocked<IStaffInvitationRepository>;
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let emailQueueService: jest.Mocked<IEmailQueuePort>;
	let invitationTokenService: jest.Mocked<IInvitationTokenService>;
	let mockConfig: IStaffInvitationConfig;
	let useCase: InviteStaffUseCase;

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
		};

		emailQueueService = {
			sendVerificationOtp: jest.fn(),
			sendStaffInvitation: jest.fn(),
		};

		invitationTokenService = {
			generateToken: jest
				.fn<(bytes?: number) => GeneratedInvitationToken>()
				.mockReturnValue({
					rawToken: "mock-raw-token",
					tokenHash: "mock-token-hash",
				}),
			hashToken: jest
				.fn<(rawToken: string) => string>()
				.mockReturnValue("mock-token-hash"),
		};

		mockConfig = {
			tokenTtlHours: 48,
			frontendUrl: "http://localhost:3000",
			invitationAcceptPath: "/invitations/accept",
		};

		useCase = new InviteStaffUseCase(
			staffInvitationRepository,
			staffRepository,
			restaurantRepository,
			emailQueueService,
			invitationTokenService,
			mockConfig,
		);
	});

	it("should successfully invite staff when restaurant exists and no duplicate staff/invitation", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByEmail.mockResolvedValue(null);
		staffInvitationRepository.findPendingByEmailAndRestaurant.mockResolvedValue(
			null,
		);
		staffInvitationRepository.save.mockResolvedValue();
		emailQueueService.sendStaffInvitation.mockResolvedValue();

		const result = await useCase.execute({
			email: "newstaff@tastybites.com",
			restaurantId: mockRestaurant.id,
		});

		expect(result.id).toBeDefined();
		expect(result.email).toBe("newstaff@tastybites.com");
		expect(result.restaurantId).toBe(mockRestaurant.id);
		expect(result.status).toBe("PENDING");
		expect(result.expiresAt).toBeInstanceOf(Date);

		expect(staffInvitationRepository.save).toHaveBeenCalledTimes(1);
		expect(emailQueueService.sendStaffInvitation).toHaveBeenCalledTimes(1);
		expect(emailQueueService.sendStaffInvitation).toHaveBeenCalledWith(
			expect.objectContaining({
				to: "newstaff@tastybites.com",
				restaurantName: "Tasty Bites",
			}),
		);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				email: "newstaff@tastybites.com",
				restaurantId: "nonexistent-id",
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
				email: "newstaff@tastybites.com",
				restaurantId: blockedRestaurant.id,
			}),
		).rejects.toThrow(RestaurantAccountBlockedError);
	});

	it("should throw RestaurantInactiveError when restaurant status is not ACTIVE or APPROVED", async () => {
		const pendingRestaurant = Restaurant.create({
			restaurantName: "Pending Bistro",
			email: "pending@bistro.com",
			phone: "+1234567890",
			ownerName: "Pending Owner",
			ownerEmail: "pending@bistro.com",
			status: "PENDING",
		});
		restaurantRepository.findById.mockResolvedValue(pendingRestaurant);

		await expect(
			useCase.execute({
				email: "newstaff@tastybites.com",
				restaurantId: pendingRestaurant.id,
			}),
		).rejects.toThrow(RestaurantInactiveError);
	});

	it("should throw StaffAlreadyExistsError when staff member already exists", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		const existingStaff = RestaurantStaff.reconstitute({
			id: "staff-1",
			restaurantId: mockRestaurant.id,
			fullname: "Existing Staff",
			email: "existing@tastybites.com",
			phone: "+1234567890",
			avatarUrl: null,
			passwordHash: "hash",
			role: "STAFF",
			status: "ACTIVE",
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		staffRepository.findByEmail.mockResolvedValue(existingStaff);

		await expect(
			useCase.execute({
				email: "existing@tastybites.com",
				restaurantId: mockRestaurant.id,
			}),
		).rejects.toThrow(StaffAlreadyExistsError);
	});

	it("should throw StaffInvitationAlreadyPendingError when active invitation already pending", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findByEmail.mockResolvedValue(null);
		const pendingInvitation = StaffInvitation.create({
			restaurantId: mockRestaurant.id,
			email: "pending@tastybites.com",
			tokenHash: "existing-hash",
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
		});
		staffInvitationRepository.findPendingByEmailAndRestaurant.mockResolvedValue(
			pendingInvitation,
		);

		await expect(
			useCase.execute({
				email: "pending@tastybites.com",
				restaurantId: mockRestaurant.id,
			}),
		).rejects.toThrow(StaffInvitationAlreadyPendingError);
	});
});
