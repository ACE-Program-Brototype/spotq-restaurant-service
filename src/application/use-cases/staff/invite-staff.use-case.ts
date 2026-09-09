import { inject, injectable } from "inversify";
import type {
	InviteStaffDTO,
	StaffInvitationResponseDTO,
} from "@/application/dtos/staff/invite-staff.dto.ts";
import type { IStaffInvitationConfig } from "@/application/ports/config/staff-invitation-config.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IEmailQueuePort } from "@/application/ports/services/email-queue.port.ts";
import type { IInvitationTokenService } from "@/application/ports/services/invitation-token.service.port.ts";
import type { IInviteStaffUseCase } from "@/application/ports/use-cases/invite-staff.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
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
import { InvitationStatusVO } from "@/domain/value-objects/invitation-status.vo.ts";
import { messages } from "@/shared/constants/message.constants.ts";

const MS_PER_HOUR = 60 * 60 * 1000;

@injectable()
export class InviteStaffUseCase implements IInviteStaffUseCase {
	constructor(
		@inject(TYPES.StaffInvitationRepository)
		private readonly staffInvitationRepository: IStaffInvitationRepository,
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.EmailQueuePort)
		private readonly emailQueueService: IEmailQueuePort,
		@inject(TYPES.InvitationTokenService)
		private readonly invitationTokenService: IInvitationTokenService,
		@inject(TYPES.StaffInvitationConfig)
		private readonly config: IStaffInvitationConfig,
	) {}

	public async execute(
		dto: InviteStaffDTO,
	): Promise<StaffInvitationResponseDTO> {
		const normalizedEmail = dto.email.trim().toLowerCase();
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

		const existingStaff =
			await this.staffRepository.findByEmail(normalizedEmail);
		if (existingStaff) {
			throw new StaffAlreadyExistsError(messages.EMAIL_ALREADY_EXISTS);
		}

		const pendingInvitation =
			await this.staffInvitationRepository.findPendingByEmailAndRestaurant(
				normalizedEmail,
				restaurantId,
			);
		if (pendingInvitation?.isPending()) {
			throw new StaffInvitationAlreadyPendingError(
				messages.STAFF_INVITATION_ALREADY_PENDING,
			);
		}

		const { rawToken, tokenHash } = this.invitationTokenService.generateToken();

		const expiresAt = new Date(
			Date.now() + this.config.tokenTtlHours * MS_PER_HOUR,
		);

		const invitation = StaffInvitation.create({
			restaurantId,
			email: normalizedEmail,
			tokenHash,
			status: InvitationStatusVO.pending(),
			expiresAt,
		});

		await this.staffInvitationRepository.save(invitation);

		const invitationUrl = `${this.config.frontendUrl}${this.config.invitationAcceptPath}?token=${rawToken}`;

		await this.emailQueueService.sendStaffInvitation({
			to: normalizedEmail,
			invitationUrl,
			restaurantName: restaurant.restaurantName,
			validityHours: this.config.tokenTtlHours,
		});

		return {
			id: invitation.id,
			email: invitation.email,
			restaurantId: invitation.restaurantId,
			status: invitation.status,
			expiresAt: invitation.expiresAt,
			createdAt: invitation.createdAt,
		};
	}
}
