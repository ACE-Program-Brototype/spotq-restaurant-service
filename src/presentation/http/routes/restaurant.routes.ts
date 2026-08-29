import { RESTAURANT_ROUTES } from "@/shared/constants/route.constants";
import express from "express";
import { validate } from "../middleware/validation.middleware";
import {
	sendRestaurantEmailOtpSchema,
	verifyRestaurantEmailOtpSchema,
} from "../validators/restaurant-email-verification.validator";
import { onboardRestaurantSchema } from "../validators/restaurant-onboard.validator";
import { restaurantAuthController } from "@/di/controllers.resolutions";

export const restaurantRouter = express.Router();

restaurantRouter.post(
	RESTAURANT_ROUTES.EMAIL_OTP,
	validate(sendRestaurantEmailOtpSchema),
	restaurantAuthController.sendEmailOtp.bind(restaurantAuthController),
);

restaurantRouter.post(
	RESTAURANT_ROUTES.RESEND_EMAIL_OTP,
	validate(sendRestaurantEmailOtpSchema),
	restaurantAuthController.resendEmailOtp.bind(restaurantAuthController),
);

restaurantRouter.post(
	RESTAURANT_ROUTES.VERIFY_EMAIL,
	validate(verifyRestaurantEmailOtpSchema),
	restaurantAuthController.verifyEmailOtp.bind(restaurantAuthController),
);

restaurantRouter.post(
	RESTAURANT_ROUTES.ONBOARD,
	validate(onboardRestaurantSchema),
	restaurantAuthController.onboard.bind(restaurantAuthController),
);
