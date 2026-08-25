import { sendRestaurantEmailOtpSchema } from "@/presentation/http/validators/restaurant-email-verification.validator";
import { z } from "zod";

export type SendRestaurantEmailOtpDto = z.infer< 
typeof sendRestaurantEmailOtpSchema
>;
