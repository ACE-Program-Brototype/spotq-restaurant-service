import { injectable } from "inversify";
import jwt from "jsonwebtoken";
import type {
	AuthTokenPayload,
	IAuthTokenService,
	TokenPair,
} from "@/application/ports/services/auth-token.service.port";
import { env, formatJwtKey } from "@/config/env";

@injectable()
export class AuthTokenService implements IAuthTokenService {
	generateAccessToken(payload: AuthTokenPayload): string {
		const privateKey = formatJwtKey(env.JWT_ACCESS_PRIVATE_KEY);
		return jwt.sign(payload, privateKey, {
			expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
			algorithm: env.JWT_ALGORITHM as jwt.Algorithm,
			keyid: env.JWT_ACCESS_TOKEN_KEY_ID,
		});
	}

	generateRefreshToken(payload: AuthTokenPayload): string {
		return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
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
		const publicKey = formatJwtKey(env.JWT_ACCESS_PUBLIC_KEY);
		return jwt.verify(token, publicKey, {
			algorithms: [env.JWT_ALGORITHM as jwt.Algorithm],
		}) as AuthTokenPayload;
	}

	verifyRefreshToken(token: string): AuthTokenPayload {
		return jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthTokenPayload;
	}
}
