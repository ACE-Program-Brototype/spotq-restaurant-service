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
		return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
			expiresIn: "15m",
		});
	}

	generateRefreshToken(payload: AuthTokenPayload): string {
		return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
			expiresIn: "7d",
		});
	}

	generateTokenPair(payload: AuthTokenPayload): TokenPair {
		return {
			accessToken: this.generateAccessToken(payload),
			refreshToken: this.generateRefreshToken(payload),
		};
	}

	verifyAccessToken(token: string): AuthTokenPayload {
		return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthTokenPayload;
	}

	verifyRefreshToken(token: string): AuthTokenPayload {
		return jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthTokenPayload;
	}
}
