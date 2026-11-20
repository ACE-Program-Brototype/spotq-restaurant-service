import { injectable } from "inversify";
import jwt from "jsonwebtoken";
import type {
	ITokenService,
	StaffTempTokenPayload,
	StaffTokenPayload,
} from "@/application/ports/services/token-service.port.ts";
import { env } from "@/config/env.ts";

@injectable()
export class JwtTokenService implements ITokenService {
	private readonly privateKey =
		env.JWT_PRIVATE_KEY || env.JWT_ACCESS_PRIVATE_KEY;
	private readonly publicKey = env.JWT_PUBLIC_KEY || env.JWT_ACCESS_PUBLIC_KEY;
	private readonly keyId = env.JWT_KEY_ID || env.JWT_ACCESS_TOKEN_KEY_ID;
	private readonly algorithm = (env.JWT_ALGORITHM || "RS256") as jwt.Algorithm;
	private readonly accessExpiresIn = env.JWT_ACCESS_EXPIRES_IN;
	private readonly refreshSecret = env.JWT_REFRESH_SECRET;
	private readonly refreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN;
	private readonly tempSecret = env.JWT_TEMP_SECRET;
	private readonly tempExpiresIn = env.JWT_TEMP_EXPIRES_IN;

	public generateAccessToken(payload: StaffTokenPayload): string {
		const claims = {
			sub: payload.sub,
			id: payload.sub,
			restaurantId: payload.restaurantId,
			email: payload.email,
			role: payload.role,
		};

		const signOptions: jwt.SignOptions = {
			algorithm: this.algorithm,
			keyid: this.keyId,
			expiresIn: this.accessExpiresIn as jwt.SignOptions["expiresIn"],
		};

		return jwt.sign(claims, this.privateKey, signOptions);
	}

	public generateRefreshToken(payload: StaffTokenPayload): string {
		return jwt.sign(payload, this.refreshSecret, {
			expiresIn: this.refreshExpiresIn as jwt.SignOptions["expiresIn"],
		});
	}

	public verifyAccessToken(token: string): StaffTokenPayload {
		const decoded = jwt.verify(token, this.publicKey, {
			algorithms: [this.algorithm],
		}) as StaffTokenPayload & { id?: string };

		return {
			sub: decoded.sub ?? decoded.id ?? "",
			restaurantId: decoded.restaurantId ?? "",
			email: decoded.email ?? "",
			role: decoded.role ?? "",
		};
	}

	public verifyRefreshToken(token: string): StaffTokenPayload {
		return jwt.verify(token, this.refreshSecret) as StaffTokenPayload;
	}

	public generateTempToken(payload: StaffTempTokenPayload): string {
		return jwt.sign(payload, this.tempSecret, {
			expiresIn: this.tempExpiresIn as jwt.SignOptions["expiresIn"],
		});
	}

	public verifyTempToken(token: string): StaffTempTokenPayload {
		return jwt.verify(token, this.tempSecret) as StaffTempTokenPayload;
	}
}
