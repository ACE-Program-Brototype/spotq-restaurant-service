import type {
	sendRestaurantEmailOtpSchema,
	verifyRestaurantEmailOtpSchema,
} from "@/presentation/http/validators/restaurant-email-verification.validator";

import type { z } from "zod";

export type SendRestaurantEmailOtpDto = z.infer<
	typeof sendRestaurantEmailOtpSchema
>;

export type VerifyRestaurantEmailOtpDto = z.infer<
	typeof verifyRestaurantEmailOtpSchema
>;
