import { inject, injectable } from "inversify";
import type {
	AcceptInvitationDTO,
	AcceptInvitationResponseDTO,
} from "@/application/dtos/staff/accept-invitation.dto.ts";
import { StaffMapper } from "@/application/mappers/staff.mapper.ts";
import type { IInvitationTokenService } from "@/application/ports/services/invitation-token.service.port.ts";
import type { IPasswordHasher } from "@/application/ports/services/password-hasher.port.ts";
import type {
	ITokenService,
	StaffTokenPayload,
} from "@/application/ports/services/token-service.port.ts";
import type { IAcceptInvitationUseCase } from "@/application/ports/use-cases/accept-invitation.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	InvalidInvitationTokenError,
	InvitationExpiredError,
	StaffAlreadyExistsError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { IStaffInvitationRepository } from "@/domain/repositories/staff-invitation.repository.interface.ts";
import { StaffRoleVO } from "@/domain/value-objects/staff-role.vo.ts";
import { StaffStatusVO } from "@/domain/value-objects/staff-status.vo.ts";

@injectable()
export class AcceptInvitationUseCase implements IAcceptInvitationUseCase {
	constructor(
		@inject(TYPES.StaffInvitationRepository)
		private readonly staffInvitationRepository: IStaffInvitationRepository,
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
		@inject(TYPES.InvitationTokenService)
		private readonly invitationTokenService: IInvitationTokenService,
		@inject(TYPES.PasswordHasher)
		private readonly passwordHasher: IPasswordHasher,
		@inject(TYPES.TokenService)
		private readonly tokenService: ITokenService,
	) {}

	public async execute(
		dto: AcceptInvitationDTO,
	): Promise<AcceptInvitationResponseDTO> {
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

		const existingStaff = await this.staffRepository.findByEmail(
			invitation.email,
		);
		if (existingStaff) {
			throw new StaffAlreadyExistsError(
				"This email is already registered as a staff member",
			);
		}

		const passwordHash = await this.passwordHasher.hash(dto.password);

		const staff = RestaurantStaff.create({
			restaurantId: invitation.restaurantId,
			fullname: dto.fullname,
			email: invitation.email,
			phone: dto.phone,
			passwordHash,
			role: StaffRoleVO.staff(),
			status: StaffStatusVO.active(),
		});

		invitation.accept();

		await this.staffInvitationRepository.createStaffWithInvitation(
			staff,
			invitation,
		);

		const tokenPayload: StaffTokenPayload = {
			sub: staff.id,
			restaurantId: staff.restaurantId,
			email: staff.email,
			role: staff.role,
		};

		const accessToken = this.tokenService.generateAccessToken(tokenPayload);
		const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

		return {
			staff: StaffMapper.toDTO(staff),
			accessToken,
			refreshToken,
		};
	}
}
