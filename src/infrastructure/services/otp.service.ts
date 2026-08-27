import type { IOtpStore } from "@/application/ports/services/otp-store.port";
import type { IOtpService } from "@/application/ports/services/otp.service.port";
import { TYPES } from "@/di/types";
import { OTP_CONFIG } from "@/shared/constants/otp.constants";
import {
	getRestaurantEmailOtpAttemptsKey,
	getRestaurantEmailOtpCooldownKey,
} from "@/utils/otp.util";
import { inject, injectable } from "inversify";

@injectable()
export class OtpService implements IOtpService {
	constructor(
		@inject(TYPES.Services.OtpStore)
		private readonly otpStore: IOtpStore,
	) {}

	async checkCooldown(email: string): Promise<boolean> {
		const cooldownKey = getRestaurantEmailOtpCooldownKey(email);

		const cooldownExists = await this.otpStore.exists(cooldownKey);

		if (cooldownExists) {
			return true;
		}

		await this.otpStore.save(
			cooldownKey,
			"1",
			OTP_CONFIG.RESEND_COOLDOWN_SECONDS,
		);

		return false;
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
