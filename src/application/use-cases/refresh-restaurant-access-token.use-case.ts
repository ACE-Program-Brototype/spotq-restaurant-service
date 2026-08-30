import { inject, injectable } from "inversify";

import type { IAuthTokenService } from "@/application/ports/services/auth-token.service.port";
import type { IRefreshRestaurantAccessTokenUseCase } from "@/application/ports/use-case/refresh-restaurant-access-token.use-case.port";
import { InvalidRefreshTokenError } from "@/application/errors/invalid-refresh-token.error";
import { TYPES } from "@/di/types";

@injectable()
export class RefreshRestaurantAccessTokenUseCase
	implements IRefreshRestaurantAccessTokenUseCase
{
	constructor(
		@inject(TYPES.Services.AuthTokenService)
		private readonly authTokenService: IAuthTokenService,
	) {}

	async execute(refreshToken: string): Promise<{ accessToken: string }> {
		if (!refreshToken?.trim()) {
			throw new InvalidRefreshTokenError();
		}

		let payload: { restaurantId: string; email: string };

		try {
			payload = this.authTokenService.verifyRefreshToken(refreshToken);
		} catch {
			throw new InvalidRefreshTokenError();
		}

		return {
			accessToken: this.authTokenService.generateAccessToken({
				restaurantId: payload.restaurantId,
				email: payload.email,
			}),
		};
	}
}
