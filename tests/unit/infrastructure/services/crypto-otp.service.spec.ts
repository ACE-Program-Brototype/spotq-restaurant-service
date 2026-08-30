import { describe, expect, it } from "@jest/globals";
import { CryptoOtpService } from "@/infrastructure/services/crypto-otp.service.ts";

describe("CryptoOtpService", () => {
	const service = new CryptoOtpService();

	it("should generate a 6-digit numeric OTP by default", () => {
		const otp = service.generateOtp();

		expect(otp).toHaveLength(6);
		expect(otp).toMatch(/^\d{6}$/);
	});

	it("should generate OTP of specified length", () => {
		const otp4 = service.generateOtp(4);
		expect(otp4).toHaveLength(4);
		expect(otp4).toMatch(/^\d{4}$/);

		const otp8 = service.generateOtp(8);
		expect(otp8).toHaveLength(8);
		expect(otp8).toMatch(/^\d{8}$/);
	});
});
