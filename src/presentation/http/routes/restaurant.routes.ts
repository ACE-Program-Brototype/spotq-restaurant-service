import express from "express";
import {
	restaurantAuthController,
	restaurantStaffManagementController,
} from "@/config/di/controllers.resolutions";
import { RESTAURANT_ROUTES } from "@/shared/constants/route.constants";
import { restaurantOwnerAuthMiddleware } from "../middleware/restaurant-owner.auth.middleware";
import { restaurantAuthMiddleware } from "../middleware/restaurant.auth.middleware";
import {
	validateRequestBody,
	validateRequestParams,
} from "../middleware/validation.middleware";
import {
	sendRestaurantEmailOtpSchema,
	verifyRestaurantEmailOtpSchema,
} from "../validators/restaurant-email-verification.validator";
import { onboardRestaurantSchema } from "../validators/restaurant-onboard.validator";
import { removeStaffParamsSchema } from "../validators/staff/remove-staff.validator";

export const restaurantRouter = express.Router();

restaurantRouter.post(
	RESTAURANT_ROUTES.EMAIL_OTP,
	validateRequestBody(sendRestaurantEmailOtpSchema),
	restaurantAuthController.sendEmailOtp.bind(restaurantAuthController),
);

restaurantRouter.post(
	RESTAURANT_ROUTES.RESEND_EMAIL_OTP,
	validateRequestBody(sendRestaurantEmailOtpSchema),
	restaurantAuthController.resendEmailOtp.bind(restaurantAuthController),
);

restaurantRouter.post(
	RESTAURANT_ROUTES.VERIFY_EMAIL,
	validateRequestBody(verifyRestaurantEmailOtpSchema),
	restaurantAuthController.verifyEmailOtp.bind(restaurantAuthController),
);

restaurantRouter.post(
	RESTAURANT_ROUTES.REFRESH_ACCESS_TOKEN,
	restaurantAuthController.refreshAccessToken.bind(restaurantAuthController),
);

restaurantRouter.post(
	RESTAURANT_ROUTES.ONBOARD,
	restaurantAuthMiddleware,
	validateRequestBody(onboardRestaurantSchema),
	restaurantAuthController.onboard.bind(restaurantAuthController),
);

restaurantRouter.get(
	RESTAURANT_ROUTES.VERIFICATION_STATUS,
	restaurantAuthMiddleware,
	restaurantAuthController.getVerificationStatus.bind(restaurantAuthController),
);

restaurantRouter.get(
	"/:id/verification-status",
	restaurantAuthMiddleware,
	restaurantAuthController.getVerificationStatus.bind(restaurantAuthController),
);

restaurantRouter.patch(
	[
		RESTAURANT_ROUTES.STAFF_REMOVE,
		RESTAURANT_ROUTES.STAFF_REMOVE_FULL,
		RESTAURANT_ROUTES.STAFF_REMOVE_PREFIX,
	],
	restaurantOwnerAuthMiddleware,
	validateRequestParams(removeStaffParamsSchema),
	restaurantStaffManagementController.removeStaff.bind(
		restaurantStaffManagementController,
	),
);
