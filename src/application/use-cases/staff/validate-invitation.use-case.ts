import { inject, injectable } from "inversify";
import type {
	ValidateInvitationDTO,
	ValidateInvitationResponseDTO,
} from "@/application/dtos/staff/validate-invitation.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IInvitationTokenService } from "@/application/ports/services/invitation-token.service.port.ts";
import type { IValidateInvitationUseCase } from "@/application/ports/use-cases/validate-invitation.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	InvalidInvitationTokenError,
	InvitationExpiredError,
} from "@/domain/errors/staff.errors.ts";
import type { IStaffInvitationRepository } from "@/domain/repositories/staff-invitation.repository.interface.ts";

@injectable()
export class ValidateInvitationUseCase implements IValidateInvitationUseCase {
	constructor(
		@inject(TYPES.StaffInvitationRepository)
		private readonly staffInvitationRepository: IStaffInvitationRepository,
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.InvitationTokenService)
		private readonly invitationTokenService: IInvitationTokenService,
	) {}

	public async execute(
		dto: ValidateInvitationDTO,
	): Promise<ValidateInvitationResponseDTO> {
		const tokenHash = this.invitationTokenService.hashToken(dto.token);
		const invitation =
			await this.staffInvitationRepository.findByTokenHash(tokenHash);

		if (!invitation?.statusVO.isPending()) {
			throw new InvalidInvitationTokenError();
		}

		if (invitation.isExpired()) {
			invitation.markExpired();
			await this.staffInvitationRepository.save(invitation);
			throw new InvitationExpiredError();
		}

		const restaurant = await this.restaurantRepository.findById(
			invitation.restaurantId,
		);

		return {
			valid: true,
			email: invitation.email,
			restaurantName: restaurant?.restaurantName ?? "Restaurant",
		};
	}
}
