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
import { TYPES } from "@/config/di/types.ts";
import {
	InvalidRefreshTokenError,
	RevokedTokenError,
	StaffInactiveError,
	StaffNotFoundError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { ITokenRevocationRepository } from "@/domain/repositories/token-revocation.repository.interface.ts";

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
			throw new InvalidRefreshTokenError("Refresh token is required");
		}

		// 1. Check if token has been revoked in Redis
		const isRevoked = await this.tokenRevocationRepository.isRevoked(token);
		if (isRevoked) {
			throw new RevokedTokenError();
		}

		// 2. Verify and decode JWT refresh token
		let payload: ReturnType<ITokenService["verifyRefreshToken"]>;
		try {
			payload = this.tokenService.verifyRefreshToken(token);
		} catch {
			throw new InvalidRefreshTokenError();
		}

		// 3. Verify staff existence
		const staff = await this.restaurantStaffRepository.findById(payload.id);
		if (!staff) {
			throw new StaffNotFoundError();
		}

		// 4. Verify staff account active status
		if (staff.isSuspended()) {
			throw new StaffSuspendedError();
		}

		if (!staff.isActive()) {
			throw new StaffInactiveError();
		}

		// 5. Generate fresh access token
		const tokenPayload: StaffTokenPayload = {
			id: staff.id,
			restaurantId: staff.restaurantId,
			email: staff.email,
			role: staff.role,
		};

		const accessToken = this.tokenService.generateAccessToken(tokenPayload);

		return {
			accessToken,
		};
	}
}
