import { TYPES } from "@di/types.ts";
import { inject, injectable } from "inversify";
import type {
	RefreshTokenDTO,
	RefreshTokenResponseDTO,
} from "@/application/dtos/staff/refresh-token.dto.ts";
import type {
	ITokenService,
	StaffTokenPayload,
} from "@/application/ports/services/token-service.port.ts";
import type { IRefreshTokenUseCase } from "@/application/ports/use-cases/refresh-token.use-case.port.ts";
import {
	InvalidRefreshTokenError,
	RevokedTokenError,
	StaffInactiveError,
	StaffNotFoundError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { ITokenRevocationRepository } from "@/domain/repositories/token-revocation.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class RefreshTokenUseCase implements IRefreshTokenUseCase {
	constructor(
		@inject(TYPES.TokenService)
		private readonly tokenService: ITokenService,
		@inject(TYPES.RestaurantStaffRepository)
		private readonly restaurantStaffRepository: IRestaurantStaffRepository,
		@inject(TYPES.TokenRevocationRepository)
		private readonly tokenRevocationRepository: ITokenRevocationRepository,
	) {}

	public async execute(dto: RefreshTokenDTO): Promise<RefreshTokenResponseDTO> {
		const token = dto.refreshToken;
		if (!token) {
			throw new InvalidRefreshTokenError(messages.REFRESH_TOKEN_REQUIRED);
		}

		const isRevoked = await this.tokenRevocationRepository.isRevoked(token);
		if (isRevoked) {
			throw new RevokedTokenError();
		}

		let payload: ReturnType<ITokenService["verifyRefreshToken"]>;
		try {
			payload = this.tokenService.verifyRefreshToken(token);
		} catch {
			throw new InvalidRefreshTokenError();
		}

		const staffId =
			(payload as unknown as { sub?: string; id?: string }).sub ??
			(payload as unknown as { id?: string }).id;
		const staff = await this.restaurantStaffRepository.findById(
			staffId as string,
		);
		if (!staff) {
			throw new StaffNotFoundError();
		}

		if (staff.isSuspended()) {
			throw new StaffSuspendedError();
		}

		if (!staff.isActive()) {
			throw new StaffInactiveError();
		}

		const tokenPayload: StaffTokenPayload = {
			id: staff.id,
			sub: staff.id,
			restaurantId: staff.restaurantId,
			email: staff.email,
			role: staff.role,
		} as StaffTokenPayload;

		const accessToken = this.tokenService.generateAccessToken(tokenPayload);

		return {
			accessToken,
		};
	}
}
