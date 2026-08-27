import { RESTAURANT_ROUTES } from "@/shared/constants/route.constants";
import express from "express";
import { validate } from "../middleware/validation.middleware";
import {
	sendRestaurantEmailOtpSchema,
	verifyRestaurantEmailOtpSchema,
} from "../validators/restaurant-email-verification.validator";
import { container } from "@/di/container";
import { TYPES } from "@/di/types";
import type { RestaurantEmailVerificationController } from "../controllers/restaurant-email-verification.controller";
import type { RestaurantRegistrationController } from "../controllers/restaurant-registeration.controller";
import { registerRestaurantSchema } from "../validators/restaurant-registration.validator";

export const restaurantRouter = express.Router();

const restaurantEmailVerificationController =
	container.get<RestaurantEmailVerificationController>(
		TYPES.Controller.RestaurantEmailVerificationController,
	);

const restaurantRegistrationController =
	container.get<RestaurantRegistrationController>(
		TYPES.Controller.RestaurantRegistrationController,
	);

restaurantRouter.post(
	RESTAURANT_ROUTES.EMAIL_OTP,
	validate(sendRestaurantEmailOtpSchema),
	restaurantEmailVerificationController.sendEmailOtp.bind(
		restaurantEmailVerificationController,
	),
);

restaurantRouter.post(
	RESTAURANT_ROUTES.RESEND_EMAIL_OTP,
	validate(sendRestaurantEmailOtpSchema),
	restaurantEmailVerificationController.resendEmailOtp.bind(
		restaurantEmailVerificationController,
	),
);

restaurantRouter.post(
	RESTAURANT_ROUTES.VERIFY_EMAIL,
	validate(verifyRestaurantEmailOtpSchema),
	restaurantEmailVerificationController.verifyEmailOtp.bind(
		restaurantEmailVerificationController,
	),
);

restaurantRouter.post(
	RESTAURANT_ROUTES.REGISTER,
	validate(registerRestaurantSchema),
	restaurantRegistrationController.register.bind(
		restaurantRegistrationController,
	),
);
