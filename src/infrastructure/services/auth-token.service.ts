import { injectable } from "inversify";
import jwt, { type SignOptions } from "jsonwebtoken";
import type {
	AuthTokenPayload,
	IAuthTokenService,
	TokenPair,
} from "@/application/ports/services/auth-token.service.port";
import { env } from "@/config/env";

@injectable()
export class AuthTokenService implements IAuthTokenService {
	generateAccessToken(payload: AuthTokenPayload): string {
		const claims = {
			sub: payload.restaurantId,
			email: payload.email,
			role: "restaurant_owner",
			restaurantId: payload.restaurantId,
		};

		const signOptions: SignOptions = {
			algorithm: env.JWT_ALGORITHM,
			keyid: env.JWT_KEY_ID,
			expiresIn: env.JWT_ACCESS_EXPIRES_IN as unknown as number,
		};

		return jwt.sign(claims, env.JWT_PRIVATE_KEY, signOptions);
	}

	generateRefreshToken(payload: AuthTokenPayload): string {
		const claims = {
			sub: payload.restaurantId,
			email: payload.email,
			role: "restaurant_owner",
			restaurantId: payload.restaurantId,
			type: "refresh",
		};

		return jwt.sign(claims, env.JWT_REFRESH_SECRET, {
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
		const decoded = jwt.verify(token, env.JWT_PUBLIC_KEY, {
			algorithms: [env.JWT_ALGORITHM],
		}) as { sub?: string; email?: string; restaurantId?: string };

		return {
			restaurantId: decoded.restaurantId ?? decoded.sub ?? "",
			email: decoded.email ?? "",
		};
	}

	verifyRefreshToken(token: string): AuthTokenPayload {
		const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
			restaurantId?: string;
			sub?: string;
			email?: string;
		};

		return {
			restaurantId: decoded.restaurantId ?? decoded.sub ?? "",
			email: decoded.email ?? "",
		};
	}
}
