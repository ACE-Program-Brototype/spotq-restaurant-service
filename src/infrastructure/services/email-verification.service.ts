import type { IEmailVerificationService } from "@/application/ports/services/email-verification.service.port";
import type { IOtpStore } from "@/application/ports/services/otp-store.port";
import { TYPES } from "@/di/types";
import { OTP_CONFIG } from "@/shared/constants/otp.constants";
import {
	generateVerificationToken,
	getRestaurantEmailVerificationTokenKey,
} from "@/utils/otp.util";
import { inject, injectable } from "inversify";

@injectable()
export class EmailVerificationService implements IEmailVerificationService {
	constructor(
		@inject(TYPES.Services.OtpStore)
		private readonly otpStore: IOtpStore,
	) {}

	async createVerificationToken(email: string): Promise<string> {
		
		const token = generateVerificationToken();

		const tokenKey = getRestaurantEmailVerificationTokenKey(token);

		await this.otpStore.save(
			tokenKey,
			email,
			OTP_CONFIG.VERIFICATION_TOKEN_EXPIRY_SECONDS,
		);

		return token;
	}

	async getVerifiedEmail(token: string): Promise<string | null> {
		const tokenKey = getRestaurantEmailVerificationTokenKey(token);

		return this.otpStore.get(tokenKey);
	}

	async deleteVerificationToken(token: string): Promise<void> {
		const tokenKey = getRestaurantEmailVerificationTokenKey(token);

		await this.otpStore.delete(tokenKey);
	}
}
