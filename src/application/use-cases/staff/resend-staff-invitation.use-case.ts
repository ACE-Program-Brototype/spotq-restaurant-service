import { inject, injectable } from "inversify";
import type {
	ResendInvitationDTO,
	ResendInvitationResponseDTO,
} from "@/application/dtos/staff/resend-invitation.dto.ts";
import type { IStaffInvitationConfig } from "@/application/ports/config/staff-invitation-config.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IEmailQueuePort } from "@/application/ports/services/email-queue.port.ts";
import type { IInvitationTokenService } from "@/application/ports/services/invitation-token.service.port.ts";
import type { IResendStaffInvitationUseCase } from "@/application/ports/use-cases/resend-invitation.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	RestaurantNotFoundError,
	StaffAlreadyExistsError,
	StaffInvitationNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { IStaffInvitationRepository } from "@/domain/repositories/staff-invitation.repository.interface.ts";
import { StaffEmail } from "@/domain/value-objects/email.vo.ts";

const MS_PER_HOUR = 60 * 60 * 1000;

@injectable()
export class ResendStaffInvitationUseCase
	implements IResendStaffInvitationUseCase
{
	constructor(
		@inject(TYPES.StaffInvitationRepository)
		private readonly staffInvitationRepository: IStaffInvitationRepository,
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.EmailQueuePort)
		private readonly emailQueuePort: IEmailQueuePort,
		@inject(TYPES.InvitationTokenService)
		private readonly invitationTokenService: IInvitationTokenService,
		@inject(TYPES.StaffInvitationConfig)
		private readonly config: IStaffInvitationConfig,
	) {}

	public async execute(
		dto: ResendInvitationDTO,
	): Promise<ResendInvitationResponseDTO> {
		const emailVO = StaffEmail.create(dto.email);

		const restaurant = await this.restaurantRepository.findById(
			dto.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		const existingStaff = await this.staffRepository.findByEmail(emailVO.value);
		if (existingStaff) {
			throw new StaffAlreadyExistsError();
		}

		let invitation =
			await this.staffInvitationRepository.findPendingByEmailAndRestaurant(
				emailVO.value,
				dto.restaurantId,
			);

		if (!invitation) {
			const allInvitations = await this.staffInvitationRepository.findByEmail(
				emailVO.value,
			);
			invitation =
				allInvitations.find(
					(inv) =>
						inv.restaurantId === dto.restaurantId && !inv.statusVO.isAccepted(),
				) ?? null;
		}

		if (!invitation) {
			throw new StaffInvitationNotFoundError(
				"No existing invitation found for this email",
			);
		}

		const { rawToken, tokenHash } = this.invitationTokenService.generateToken();
		const expiresAt = new Date(
			Date.now() + this.config.tokenTtlHours * MS_PER_HOUR,
		);

		invitation.renew(tokenHash, expiresAt);
		await this.staffInvitationRepository.save(invitation);

		const invitationUrl = `${this.config.frontendUrl}${this.config.invitationAcceptPath}?token=${rawToken}`;

		await this.emailQueuePort.sendStaffInvitation({
			to: emailVO.value,
			invitationUrl,
			restaurantName: restaurant.restaurantName,
			validityHours: this.config.tokenTtlHours,
		});

		return {
			id: invitation.id,
			restaurantId: invitation.restaurantId,
			email: invitation.email,
			status: invitation.status,
			expiresAt: invitation.expiresAt,
			createdAt: invitation.createdAt,
		};
	}
}
