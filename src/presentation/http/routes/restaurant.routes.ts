import express from "express";
import { container } from "@/config/di/container";
import { restaurantAuthController } from "@/config/di/controllers.resolutions";
import { TYPES } from "@/config/di/types";
import type { StaffController } from "@/presentation/http/controllers/staff.controller";
import { restaurantOwnerAuthMiddleware } from "@/presentation/http/middleware/restaurant-owner.auth.middleware";
import {
	validate,
	validateRequestQuery,
} from "@/presentation/http/middleware/validation.middleware";
import { listStaffSchema } from "@/presentation/http/validators/staff/list-staff.validator";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { RESTAURANT_ROUTES } from "@/shared/constants/route.constants";
import {
	sendRestaurantEmailOtpSchema,
	verifyRestaurantEmailOtpSchema,
} from "../validators/restaurant-email-verification.validator";
import { onboardRestaurantSchema } from "../validators/restaurant-onboard.validator";

export const restaurantRouter = express.Router();

const staffController = container.get<StaffController>(TYPES.StaffController);

restaurantRouter.get(
	RESTAURANT_ROUTES.STAFF_LIST,
	restaurantOwnerAuthMiddleware,
	validateRequestQuery(listStaffSchema, HTTP_STATUS.BAD_REQUEST),
	staffController.listStaff,
);

restaurantRouter.get(
	`/restaurants${RESTAURANT_ROUTES.STAFF_LIST}`,
	restaurantOwnerAuthMiddleware,
	validateRequestQuery(listStaffSchema, HTTP_STATUS.BAD_REQUEST),
	staffController.listStaff,
);

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
