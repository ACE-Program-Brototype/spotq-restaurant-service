import type { sendRestaurantEmailOtpSchema } from "@/presentation/http/validators/restaurant-email-verification.validator";
import type { z } from "zod";

export type SendRestaurantEmailOtpDto = z.infer<
	typeof sendRestaurantEmailOtpSchema
>;
