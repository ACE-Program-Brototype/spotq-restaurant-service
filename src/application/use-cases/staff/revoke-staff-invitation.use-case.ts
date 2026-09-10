import { inject, injectable } from "inversify";
import type {
	RevokeInvitationDTO,
	RevokeInvitationResponseDTO,
} from "@/application/dtos/staff/revoke-invitation.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IRevokeStaffInvitationUseCase } from "@/application/ports/use-cases/revoke-invitation.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { StaffInvitation } from "@/domain/entities/staff-invitation.entity.ts";
import {
	RestaurantAccountBlockedError,
	RestaurantInactiveError,
	RestaurantNotFoundError,
	StaffInvitationNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IStaffInvitationRepository } from "@/domain/repositories/staff-invitation.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class RevokeStaffInvitationUseCase
	implements IRevokeStaffInvitationUseCase
{
	constructor(
		@inject(TYPES.StaffInvitationRepository)
		private readonly staffInvitationRepository: IStaffInvitationRepository,
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	public async execute(
		dto: RevokeInvitationDTO,
	): Promise<RevokeInvitationResponseDTO> {
		const restaurantId = dto.restaurantId.trim();

		const restaurant = await this.restaurantRepository.findById(restaurantId);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		if (restaurant.isBlocked) {
			throw new RestaurantAccountBlockedError(
				messages.RESTAURANT_ACCOUNT_BLOCKED,
			);
		}

		if (!restaurant.statusVO.isActive() && !restaurant.statusVO.isApproved()) {
			throw new RestaurantInactiveError(messages.RESTAURANT_INACTIVE);
		}
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
				messages.STAFF_INVITATION_NOT_FOUND,
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
