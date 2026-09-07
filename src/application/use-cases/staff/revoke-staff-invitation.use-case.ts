import { inject, injectable } from "inversify";
import type {
	RevokeInvitationDTO,
	RevokeInvitationResponseDTO,
} from "@/application/dtos/staff/revoke-invitation.dto.ts";
import type { IRevokeStaffInvitationUseCase } from "@/application/ports/use-cases/revoke-invitation.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { StaffInvitation } from "@/domain/entities/staff-invitation.entity.ts";
import { StaffInvitationNotFoundError } from "@/domain/errors/staff.errors.ts";
import type { IStaffInvitationRepository } from "@/domain/repositories/staff-invitation.repository.interface.ts";

@injectable()
export class RevokeStaffInvitationUseCase
	implements IRevokeStaffInvitationUseCase
{
	constructor(
		@inject(TYPES.StaffInvitationRepository)
		private readonly staffInvitationRepository: IStaffInvitationRepository,
	) {}

	public async execute(
		dto: RevokeInvitationDTO,
	): Promise<RevokeInvitationResponseDTO> {
		let invitation: StaffInvitation | null = null;

		if (dto.invitationId) {
			invitation = await this.staffInvitationRepository.findById(
				dto.invitationId,
			);
		} else if (dto.email) {
			invitation =
				await this.staffInvitationRepository.findPendingByEmailAndRestaurant(
					dto.email,
					dto.restaurantId,
				);
		}

		if (!invitation || invitation.restaurantId !== dto.restaurantId) {
			throw new StaffInvitationNotFoundError(
				"Staff invitation not found for this restaurant",
			);
		}

		invitation.revoke();
		await this.staffInvitationRepository.save(invitation);

		return {
			revoked: true,
			invitationId: invitation.id,
		};
	}
}
