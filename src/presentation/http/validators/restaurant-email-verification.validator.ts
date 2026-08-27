import { z } from "zod";

export const sendRestaurantEmailOtpSchema = z.object({
	email: z.string().trim().toLowerCase().email(),
});

export const verifyRestaurantEmailOtpSchema = z.object({
  email: z.string().trim().email(),

  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});
