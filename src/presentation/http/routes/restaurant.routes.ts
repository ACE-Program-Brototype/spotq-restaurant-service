import { RESTAURANT_ROUTES } from "@/shared/constants/route.constants";
import express from "express";
import { validate } from "../middleware/validation.middleware";
import { sendRestaurantEmailOtpSchema } from "../validators/restaurant-email-verification.validator";
import { container } from "@/di/container";
import { TYPES } from "@/di/types";
import type { RestaurantEmailVerificationController } from "../controllers/restaurant-email-verification.controller";

export const restaurantRouter = express.Router();

const restaurantEmailVerificationController =
	container.get<RestaurantEmailVerificationController>(
		TYPES.Controller.RestaurantEmailVerificationController,
	);

restaurantRouter.post(
	RESTAURANT_ROUTES.EMAIL_OTP,
	validate(sendRestaurantEmailOtpSchema),
	restaurantEmailVerificationController.sendEmailOtp.bind(
		restaurantEmailVerificationController,
	),
);
