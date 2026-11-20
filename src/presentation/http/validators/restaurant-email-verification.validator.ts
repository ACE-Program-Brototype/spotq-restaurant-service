import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const sendRestaurantEmailOtpSchema = z.object({
	email: z.string().trim().toLowerCase().email(),
});

export const verifyRestaurantEmailOtpSchema = z.object({
	email: z.string().trim().toLowerCase().email(),

	otp: z
		.string()
		.trim()
		.regex(/^\d{6}$/, messages.OTP_DIGITS_REQUIRED),
});
