import express from "express";
import {
	restaurantAuthController,
  restaurantStatusController,
	staffController,
} from "@/config/di/controllers.resolutions";
import { RESTAURANT_ROUTES } from "@/shared/constants/route.constants";
import { staffAuthMiddleware } from "../middleware/staff.auth.middleware";
import {
	validate,
	validateRequestParams,
} from "../middleware/validation.middleware";
import { restaurantAuthMiddleware } from "../middleware/restaurant.auth.middleware";
import { validateRequestBody } from "../middleware/validation.middleware";
import {
	sendRestaurantEmailOtpSchema,
	verifyRestaurantEmailOtpSchema,
} from "../validators/restaurant-email-verification.validator";
import { onboardRestaurantSchema } from "../validators/restaurant-onboard.validator";
import {
	updateStaffProfileBodySchema,
	updateStaffProfileParamsSchema,
} from "../validators/staff/update-staff-profile.validator";

export const restaurantRouter = express.Router();

restaurantRouter.get(
	RESTAURANT_ROUTES.STATUS,
	restaurantStatusController.getStatus.bind(restaurantStatusController),
);

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
	RESTAURANT_ROUTES.REGISTRATION_REFRESH_TOKEN,
	restaurantAuthController.refreshAccessToken.bind(restaurantAuthController),
);

restaurantRouter.post(
	RESTAURANT_ROUTES.ONBOARD,
	restaurantAuthMiddleware,
	validateRequestBody(onboardRestaurantSchema),
	restaurantAuthController.onboard.bind(restaurantAuthController),
);

restaurantRouter.patch(
	RESTAURANT_ROUTES.UPDATE_STAFF_PROFILE,
	staffAuthMiddleware,
	validateRequestParams(updateStaffProfileParamsSchema),
	validate(updateStaffProfileBodySchema),
	staffController.updateProfile,
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
