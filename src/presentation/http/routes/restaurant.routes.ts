import {
	restaurantAuthController,
	restaurantStaffManagementController,
} from "@/config/di/controllers.resolutions";
import { RESTAURANT_ROUTES } from "@/shared/constants/route.constants";
import express from "express";
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
import { getStaffDetailParamsSchema } from "../validators/staff/get-staff-detail.validator";

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

restaurantRouter.get(
	[
		RESTAURANT_ROUTES.STAFF_DETAIL,
		RESTAURANT_ROUTES.STAFF_DETAIL_FULL,
		RESTAURANT_ROUTES.STAFF_DETAIL_PREFIX,
	],
	restaurantOwnerAuthMiddleware,
	validateRequestParams(getStaffDetailParamsSchema),
	restaurantStaffManagementController.getStaffDetail.bind(
		restaurantStaffManagementController,
	),
);


