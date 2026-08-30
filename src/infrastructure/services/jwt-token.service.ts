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
	private readonly accessSecret = env.JWT_ACCESS_SECRET;
	private readonly accessExpiresIn = env.JWT_ACCESS_EXPIRES_IN;
	private readonly refreshSecret = env.JWT_REFRESH_SECRET;
	private readonly refreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN;
	private readonly tempSecret = env.JWT_TEMP_SECRET;
	private readonly tempExpiresIn = env.JWT_TEMP_EXPIRES_IN;

	public generateAccessToken(payload: StaffTokenPayload): string {
		return jwt.sign(payload, this.accessSecret, {
			expiresIn: this.accessExpiresIn as jwt.SignOptions["expiresIn"],
		});
	}

	public generateRefreshToken(payload: StaffTokenPayload): string {
		return jwt.sign(payload, this.refreshSecret, {
			expiresIn: this.refreshExpiresIn as jwt.SignOptions["expiresIn"],
		});
	}

	public verifyAccessToken(token: string): StaffTokenPayload {
		return jwt.verify(token, this.accessSecret) as StaffTokenPayload;
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
