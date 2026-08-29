import type { IOtpStore } from "@/application/ports/services/otp-store.port";
import type { IOtpService } from "@/application/ports/services/otp.service.port";
import { TYPES } from "@/di/types";
import { OTP_CONFIG } from "@/shared/constants/otp.constants";
import {
	getRestaurantEmailOtpAttemptsKey,
	getRestaurantEmailOtpResendKey,
	getRestaurantEmailOtpSendKey,
} from "@/utils/otp.util";
import { inject, injectable } from "inversify";

@injectable()
export class OtpService implements IOtpService {
	constructor(
		@inject(TYPES.Services.OtpStore)
		private readonly otpStore: IOtpStore,
	) {}

	async checkSendRateLimit(email: string): Promise<boolean> {
		const sendKey = getRestaurantEmailOtpSendKey(email);
		const count = await this.otpStore.increment(
			sendKey,
			OTP_CONFIG.SEND_OTP_WINDOW_SECONDS,
		);

		return count > OTP_CONFIG.SEND_OTP_REQUEST_LIMIT;
	}

	async checkResendRateLimit(email: string): Promise<boolean> {
		const resendKey = getRestaurantEmailOtpResendKey(email);
		const count = await this.otpStore.increment(
			resendKey,
			OTP_CONFIG.RESEND_OTP_WINDOW_SECONDS,
		);

		return count > OTP_CONFIG.RESEND_OTP_REQUEST_LIMIT;
	}

	async resetAttempts(email: string): Promise<void> {
		const attemptsKey = getRestaurantEmailOtpAttemptsKey(email);

		await this.otpStore.delete(attemptsKey);
	}

	async incrementAttempt(email: string): Promise<number> {
		const attemptsKey = getRestaurantEmailOtpAttemptsKey(email);

		return this.otpStore.increment(attemptsKey, OTP_CONFIG.EXPIRY_SECONDS);
	}
}
