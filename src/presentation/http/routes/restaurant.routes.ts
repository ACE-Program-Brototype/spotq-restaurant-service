import express from "express";
import {
	restaurantAuthController,
	restaurantStaffManagementController,
	restaurantStatusController,
	staffController,
} from "@/config/di/controllers.resolutions";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { RESTAURANT_ROUTES } from "@/shared/constants/route.constants";
import { restaurantAuthMiddleware } from "../middleware/restaurant.auth.middleware";
import { restaurantOwnerAuthMiddleware } from "../middleware/restaurant-owner.auth.middleware";
import { staffAuthMiddleware } from "../middleware/staff.auth.middleware";
import {
	validate,
	validateRequestBody,
	validateRequestParams,
	validateRequestQuery,
} from "../middleware/validation.middleware";
import {
	sendRestaurantEmailOtpSchema,
	verifyRestaurantEmailOtpSchema,
} from "../validators/restaurant-email-verification.validator";
import { onboardRestaurantSchema } from "../validators/restaurant-onboard.validator";
import { updateRestaurantProfileSchema } from "../validators/update-restaurant-profile.validator";
import { getStaffDetailParamsSchema } from "../validators/staff/get-staff-detail.validator";
import { listStaffSchema } from "../validators/staff/list-staff.validator";
import {
	updateStaffProfileBodySchema,
	updateStaffProfileParamsSchema,
} from "../validators/staff/update-staff-profile.validator";

export const restaurantRouter = express.Router();

restaurantRouter.get(
	RESTAURANT_ROUTES.STAFF_LIST,
	restaurantOwnerAuthMiddleware,
	validateRequestQuery(listStaffSchema, HTTP_STATUS.BAD_REQUEST),
	staffController.listStaff,
);

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
	RESTAURANT_ROUTES.VERIFICATION_STATUS_BY_ID,
	restaurantAuthMiddleware,
	restaurantAuthController.getVerificationStatus.bind(restaurantAuthController),
);

restaurantRouter.get(
	RESTAURANT_ROUTES.PROFILE,
	restaurantAuthMiddleware,
	restaurantAuthController.getProfile.bind(restaurantAuthController),
);

restaurantRouter.put(
	RESTAURANT_ROUTES.PROFILE,
	restaurantAuthMiddleware,
	validateRequestBody(updateRestaurantProfileSchema),
	restaurantAuthController.updateProfile.bind(restaurantAuthController),
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
