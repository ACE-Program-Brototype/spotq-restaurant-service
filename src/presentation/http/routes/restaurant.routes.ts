import express from "express";
import {
	customerRestaurantController,
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
	createAddonBodySchema,
	createAddonParamsSchema,
	listAddonsParamsSchema,
} from "../validators/create-addon.validator";
import {
	createMenuCategoryBodySchema,
	createMenuCategoryParamsSchema,
} from "../validators/create-menu-category.validator";
import {
	createMenuItemBodySchema,
	createMenuItemParamsSchema,
} from "../validators/create-menu-item.validator";
import { deleteAddonParamsSchema } from "../validators/delete-addon.validator";
import { deleteMenuCategoryParamsSchema } from "../validators/delete-menu-category.validator";
import { deleteMenuItemParamsSchema } from "../validators/delete-menu-item.validator";
import { getMenuItemDetailsParamsSchema } from "../validators/get-menu-item-details.validator";
import { listCustomerRestaurantsQuerySchema } from "../validators/list-customer-restaurants.validator";
import { listMenuCategoriesParamSchema } from "../validators/list-menu-categories.validator";
import {
	listMenuItemsParamsSchema,
	listMenuItemsQuerySchema,
} from "../validators/list-menu-items.validator";
import {
	listStaffMenuItemsParamsSchema,
	listStaffMenuItemsQuerySchema,
} from "../validators/list-staff-menu-items.validator";
import {
	sendRestaurantEmailOtpSchema,
	verifyRestaurantEmailOtpSchema,
} from "../validators/restaurant-email-verification.validator";
import { onboardRestaurantSchema } from "../validators/restaurant-onboard.validator";
import { getStaffDetailParamsSchema } from "../validators/staff/get-staff-detail.validator";
import { listStaffSchema } from "../validators/staff/list-staff.validator";
import { removeStaffParamsSchema } from "../validators/staff/remove-staff.validator";
import {
	updateStaffProfileBodySchema,
	updateStaffProfileParamsSchema,
} from "../validators/staff/update-staff-profile.validator";
import {
	updateStaffStatusParamsSchema,
	updateStaffStatusSchema,
} from "../validators/staff/update-staff-status.validator";
import {
	updateAddonBodySchema,
	updateAddonParamsSchema,
} from "../validators/update-addon.validator";
import {
	updateMenuCategoryBodySchema,
	updateMenuCategoryParamsSchema,
} from "../validators/update-menu-category.validator";
import {
	updateMenuCategoryStatusBodySchema,
	updateMenuCategoryStatusParamsSchema,
} from "../validators/update-menu-category-status.validator";
import {
	updateMenuItemBodySchema,
	updateMenuItemParamsSchema,
} from "../validators/update-menu-item.validator";
import {
	updateMenuItemStatusBodySchema,
	updateMenuItemStatusParamsSchema,
} from "../validators/update-menu-item-status.validator";
import { updateRestaurantProfileSchema } from "../validators/update-restaurant-profile.validator";
import { addonRouter } from "./addon.routes";
import { menuRouter } from "./menu.routes";

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

restaurantRouter.get(
	RESTAURANT_ROUTES.CUSTOMER_LIST,
	validateRequestQuery(
		listCustomerRestaurantsQuerySchema,
		HTTP_STATUS.BAD_REQUEST,
	),
	customerRestaurantController.listRestaurants,
);

restaurantRouter.patch(
	RESTAURANT_ROUTES.STAFF_UPDATE,
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

restaurantRouter.delete(
	RESTAURANT_ROUTES.STAFF_REMOVE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(removeStaffParamsSchema),
	restaurantStaffManagementController.removeStaff.bind(
		restaurantStaffManagementController,
	),
);

// menu router
restaurantRouter.use(menuRouter);

// addon router
restaurantRouter.use(addonRouter);

export { menuRouter, addonRouter };
