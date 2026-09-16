import { injectable } from "inversify";
import jwt from "jsonwebtoken";
import type {
	AuthTokenPayload,
	IAuthTokenService,
	TokenPair,
} from "@/application/ports/services/auth-token.service.port";
import { env } from "@/config/env";

@injectable()
export class AuthTokenService implements IAuthTokenService {
	generateAccessToken(payload: AuthTokenPayload): string {
		const tokenPayload = {
			sub: payload.sub || payload.restaurantId,
			role: payload.role || "RESTAURANT_OWNER",
			...payload,
		};
		return jwt.sign(tokenPayload, env.JWT_ACCESS_PRIVATE_KEY, {
			expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
			algorithm: env.JWT_ALGORITHM as jwt.Algorithm,
			keyid: env.JWT_ACCESS_TOKEN_KEY_ID,
		});
	}

	generateRefreshToken(payload: AuthTokenPayload): string {
		const tokenPayload = {
			sub: payload.sub || payload.restaurantId,
			role: payload.role || "RESTAURANT_OWNER",
			...payload,
		};
		return jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
			expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
		});
	}

	generateTokenPair(payload: AuthTokenPayload): TokenPair {
		return {
			accessToken: this.generateAccessToken(payload),
			refreshToken: this.generateRefreshToken(payload),
		};
	}

	verifyAccessToken(token: string): AuthTokenPayload {
		return jwt.verify(token, env.JWT_ACCESS_PUBLIC_KEY, {
			algorithms: [env.JWT_ALGORITHM as jwt.Algorithm],
		}) as AuthTokenPayload;
	}

	verifyRefreshToken(token: string): AuthTokenPayload {
		return jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthTokenPayload;
	}
}
