import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { RevokeStaffInvitationUseCase } from "@/application/use-cases/staff/revoke-staff-invitation.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { StaffInvitation } from "@/domain/entities/staff-invitation.entity.ts";
import {
	RestaurantAccountBlockedError,
	RestaurantInactiveError,
	RestaurantNotFoundError,
	StaffInvitationNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IStaffInvitationRepository } from "@/domain/repositories/staff-invitation.repository.interface.ts";

describe("RevokeStaffInvitationUseCase", () => {
	let staffInvitationRepository: jest.Mocked<IStaffInvitationRepository>;
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let useCase: RevokeStaffInvitationUseCase;

	const mockRestaurant = Restaurant.create({
		id: "restaurant-1",
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

		restaurantRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			existsByEmail: jest.fn(),
			createRestaurant: jest.fn(),
			create: jest.fn(),
			findUnique: jest.fn(),
			find: jest.fn(),
			update: jest.fn(),
		};

		restaurantRepository.findById.mockResolvedValue(mockRestaurant);

		useCase = new RevokeStaffInvitationUseCase(
			staffInvitationRepository,
			restaurantRepository,
		);
	});

	it("should revoke invitation by invitationId", async () => {
		const invitation = StaffInvitation.create({
			restaurantId: "restaurant-1",
			email: "staff@example.com",
			tokenHash: "token-hash",
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
		});

		staffInvitationRepository.findById.mockResolvedValue(invitation);
		staffInvitationRepository.save.mockResolvedValue();

		const result = await useCase.execute({
			restaurantId: "restaurant-1",
			invitationId: invitation.id,
		});

		expect(result).toEqual({
			revoked: true,
			invitationId: invitation.id,
		});
		expect(invitation.status).toBe("REVOKED");
		expect(staffInvitationRepository.save).toHaveBeenCalledWith(invitation);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: "nonexistent",
				invitationId: "inv-1",
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
				invitationId: "inv-1",
			}),
		).rejects.toThrow(RestaurantAccountBlockedError);
	});

	it("should throw RestaurantInactiveError when restaurant status is not ACTIVE or APPROVED", async () => {
		const rejectedRestaurant = Restaurant.create({
			restaurantName: "Rejected Bistro",
			email: "rejected@bistro.com",
			phone: "+1234567890",
			ownerName: "Rejected Owner",
			ownerEmail: "rejected@bistro.com",
			status: "REJECTED",
		});
		restaurantRepository.findById.mockResolvedValue(rejectedRestaurant);

		await expect(
			useCase.execute({
				restaurantId: rejectedRestaurant.id,
				invitationId: "inv-1",
			}),
		).rejects.toThrow(RestaurantInactiveError);
	});

	it("should throw StaffInvitationNotFoundError when invitation does not belong to restaurant", async () => {
		const invitation = StaffInvitation.create({
			restaurantId: "restaurant-1",
			email: "staff@example.com",
			tokenHash: "token-hash",
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
		});

		staffInvitationRepository.findById.mockResolvedValue(invitation);

		await expect(
			useCase.execute({
				restaurantId: "different-restaurant",
				invitationId: invitation.id,
			}),
		).rejects.toThrow(StaffInvitationNotFoundError);
	});
});
