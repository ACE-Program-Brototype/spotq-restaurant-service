import { OtpHashService } from "@/infrastructure/services/otp-hash.service";
import { generateOtp, getRestaurantEmailOtpKey } from "@/utils/otp.util";

describe("OTP Flow Integration Test", () => {
	it("should hash generated OTP and verify successfully with same OTP string", async () => {
		const hashService = new OtpHashService();
		const otp = generateOtp();
		const hash = await hashService.hash(otp);

		const isValid = await hashService.compare(otp, hash);
		expect(isValid).toBe(true);
	});

	it("should fail verification if OTP string is incorrect", async () => {
		const hashService = new OtpHashService();
		const otp = generateOtp();
		const hash = await hashService.hash(otp);

		const isValid = await hashService.compare("000000", hash);
		expect(isValid).toBe(false);
	});

	it("should generate same Redis key for email regardless of casing", () => {
		const key1 = getRestaurantEmailOtpKey("TestUser@Example.Com");
		const key2 = getRestaurantEmailOtpKey("testuser@example.com");
		expect(key1).toBe(key2);
		expect(key1).toBe("restaurant:email-verification:testuser@example.com");
	});
});
