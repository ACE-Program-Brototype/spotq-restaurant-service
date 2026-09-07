import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { RevokeStaffInvitationUseCase } from "@/application/use-cases/staff/revoke-staff-invitation.use-case.ts";
import { StaffInvitation } from "@/domain/entities/staff-invitation.entity.ts";
import { StaffInvitationNotFoundError } from "@/domain/errors/staff.errors.ts";
import type { IStaffInvitationRepository } from "@/domain/repositories/staff-invitation.repository.interface.ts";

describe("RevokeStaffInvitationUseCase", () => {
	let staffInvitationRepository: jest.Mocked<IStaffInvitationRepository>;
	let useCase: RevokeStaffInvitationUseCase;

	beforeEach(() => {
		staffInvitationRepository = {
			findById: jest.fn(),
			findByTokenHash: jest.fn(),
			findByEmail: jest.fn(),
			findPendingByEmailAndRestaurant: jest.fn(),
			findByRestaurantId: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
		};

		useCase = new RevokeStaffInvitationUseCase(staffInvitationRepository);
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
