import express from "express";
import {
	restaurantAuthController,
	restaurantStaffManagementController,
} from "@/config/di/controllers.resolutions";
import { RESTAURANT_ROUTES } from "@/shared/constants/route.constants";
import { restaurantOwnerAuthMiddleware } from "../middleware/restaurant-owner.auth.middleware";
import {
	validate,
	validateRequestParams,
} from "../middleware/validation.middleware";
import {
	sendRestaurantEmailOtpSchema,
	verifyRestaurantEmailOtpSchema,
} from "../validators/restaurant-email-verification.validator";
import { onboardRestaurantSchema } from "../validators/restaurant-onboard.validator";
import {
	updateStaffInfoParamsSchema,
	updateStaffInfoSchema,
} from "../validators/staff/update-staff-info.validator";

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
	RESTAURANT_ROUTES.REFRESH_ACCESS_TOKEN,
	restaurantAuthController.refreshAccessToken.bind(restaurantAuthController),
);

restaurantRouter.post(
	RESTAURANT_ROUTES.ONBOARD,
	validate(onboardRestaurantSchema),
	restaurantAuthController.onboard.bind(restaurantAuthController),
);

restaurantRouter.patch(
	RESTAURANT_ROUTES.STAFF_UPDATE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(updateStaffInfoParamsSchema),
	validate(updateStaffInfoSchema),
	restaurantStaffManagementController.updateStaffInfo.bind(
		restaurantStaffManagementController,
	),
);
