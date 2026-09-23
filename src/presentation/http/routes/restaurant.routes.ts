import express from "express";
import {
	menuCategoryController,
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
	createMenuCategoryBodySchema,
	createMenuCategoryParamsSchema,
} from "../validators/create-menu-category.validator";
import {
	sendRestaurantEmailOtpSchema,
	verifyRestaurantEmailOtpSchema,
} from "../validators/restaurant-email-verification.validator";
import { onboardRestaurantSchema } from "../validators/restaurant-onboard.validator";
import { getStaffDetailParamsSchema } from "../validators/staff/get-staff-detail.validator";
import { listStaffSchema } from "../validators/staff/list-staff.validator";
import { removeStaffParamsSchema } from "../validators/staff/remove-staff.validator";
import {
	updateStaffInfoParamsSchema,
	updateStaffInfoSchema,
} from "../validators/staff/update-staff-info.validator";
import {
	updateStaffProfileBodySchema,
	updateStaffProfileParamsSchema,
} from "../validators/staff/update-staff-profile.validator";
import {
	updateStaffStatusParamsSchema,
	updateStaffStatusSchema,
} from "../validators/staff/update-staff-status.validator";
import { updateRestaurantProfileSchema } from "../validators/update-restaurant-profile.validator";

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
	RESTAURANT_ROUTES.STAFF_STATUS_UPDATE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(updateStaffStatusParamsSchema),
	validate(updateStaffStatusSchema),
	restaurantStaffManagementController.updateStaffStatus.bind(
		restaurantStaffManagementController,
	),
);

const updateStaffProfileChain: express.RequestHandler[] = [
	staffAuthMiddleware,
	validateRequestParams(updateStaffProfileParamsSchema),
	validate(updateStaffProfileBodySchema),
	staffController.updateProfile,
];

const updateStaffInfoChain: express.RequestHandler[] = [
	restaurantOwnerAuthMiddleware,
	validateRequestParams(updateStaffInfoParamsSchema),
	validate(updateStaffInfoSchema),
	restaurantStaffManagementController.updateStaffInfo.bind(
		restaurantStaffManagementController,
	),
];

restaurantRouter.patch(RESTAURANT_ROUTES.STAFF_UPDATE, (req, res, next) => {
	const role = req.headers["x-user-role"];
	const normalizedRole = (Array.isArray(role) ? role[0] : role)
		?.toLowerCase()
		.trim();

	const chain =
		normalizedRole === "staff" ? updateStaffProfileChain : updateStaffInfoChain;

	let index = 0;
	const executeChain = (err?: unknown) => {
		if (err) return next(err);
		const middleware = chain[index++];
		if (middleware) {
			return middleware(req, res, executeChain);
		}
	};
	executeChain();
});

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

restaurantRouter.delete(
	RESTAURANT_ROUTES.STAFF_REMOVE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(removeStaffParamsSchema),
	restaurantStaffManagementController.removeStaff.bind(
		restaurantStaffManagementController,
	),
);

restaurantRouter.post(
	[
		RESTAURANT_ROUTES.MENU_CATEGORIES,
		RESTAURANT_ROUTES.MENU_CATEGORIES_PREFIX,
		RESTAURANT_ROUTES.MENU_CATEGORIES_FULL,
	],
	restaurantOwnerAuthMiddleware,
	validateRequestParams(createMenuCategoryParamsSchema),
	validateRequestBody(createMenuCategoryBodySchema),
	menuCategoryController.createCategory.bind(menuCategoryController),
);
