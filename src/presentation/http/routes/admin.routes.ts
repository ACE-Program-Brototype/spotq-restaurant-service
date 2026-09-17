import express from "express";
import { adminRestaurantController } from "@/config/di/controllers.resolutions.ts";
import { adminAuthMiddleware } from "@/presentation/http/middleware/admin.auth.middleware.ts";
import {
	approveRestaurantRateLimiter,
	blockRestaurantRateLimiter,
	rejectRestaurantRateLimiter,
	unblockRestaurantRateLimiter,
} from "@/presentation/http/middleware/rate-limiter.middleware.ts";
import {
	validateRequestBody,
	validateRequestParams,
	validateRequestQuery,
} from "@/presentation/http/middleware/validation.middleware.ts";
import { approveRestaurantParamSchema } from "@/presentation/http/validators/admin/approve-restaurant.validator.ts";
import {
	blockRestaurantBodySchema,
	blockRestaurantParamSchema,
} from "@/presentation/http/validators/admin/block-restaurant.validator.ts";
import { getRestaurantApplicationDetailsParamSchema } from "@/presentation/http/validators/admin/get-restaurant-application-details.validator.ts";
import { getRestaurantDetailsParamSchema } from "@/presentation/http/validators/admin/get-restaurant-details.validator.ts";
import { listRestaurantApplicationsSchema } from "@/presentation/http/validators/admin/list-restaurant-applications.validator.ts";
import { listRestaurantsQuerySchema } from "@/presentation/http/validators/admin/list-restaurants.validator.ts";
import {
	rejectRestaurantBodySchema,
	rejectRestaurantParamSchema,
} from "@/presentation/http/validators/admin/reject-restaurant.validator.ts";
import { unblockRestaurantParamSchema } from "@/presentation/http/validators/admin/unblock-restaurant.validator.ts";
import { ADMIN_ROUTES } from "@/shared/constants/route.constants.ts";

export const adminRouter = express.Router();

adminRouter.get(
	ADMIN_ROUTES.APPLICATIONS,
	adminAuthMiddleware,
	validateRequestQuery(listRestaurantApplicationsSchema),
	adminRestaurantController.listRestaurantApplications.bind(
		adminRestaurantController,
	),
);

adminRouter.get(
	ADMIN_ROUTES.APPLICATION_DETAILS,
	adminAuthMiddleware,
	validateRequestParams(getRestaurantApplicationDetailsParamSchema),
	adminRestaurantController.getRestaurantApplicationDetails.bind(
		adminRestaurantController,
	),
);

adminRouter.patch(
	ADMIN_ROUTES.APPROVE_RESTAURANT,
	adminAuthMiddleware,
	approveRestaurantRateLimiter,
	validateRequestParams(approveRestaurantParamSchema),
	adminRestaurantController.approveRestaurant.bind(adminRestaurantController),
);

adminRouter.patch(
	ADMIN_ROUTES.REJECT_RESTAURANT,
	adminAuthMiddleware,
	rejectRestaurantRateLimiter,
	validateRequestParams(rejectRestaurantParamSchema),
	validateRequestBody(rejectRestaurantBodySchema),
	adminRestaurantController.rejectRestaurant.bind(adminRestaurantController),
);

adminRouter.get(
	ADMIN_ROUTES.RESTAURANTS,
	adminAuthMiddleware,
	validateRequestQuery(listRestaurantsQuerySchema),
	adminRestaurantController.listRestaurants.bind(adminRestaurantController),
);

adminRouter.get(
	ADMIN_ROUTES.GET_RESTAURANT_DETAILS,
	adminAuthMiddleware,
	validateRequestParams(getRestaurantDetailsParamSchema),
	adminRestaurantController.getRestaurantDetails.bind(
		adminRestaurantController,
	),
);

adminRouter.patch(
	ADMIN_ROUTES.BLOCK_RESTAURANT,
	adminAuthMiddleware,
	blockRestaurantRateLimiter,
	validateRequestParams(blockRestaurantParamSchema),
	validateRequestBody(blockRestaurantBodySchema),
	adminRestaurantController.blockRestaurant.bind(adminRestaurantController),
);

adminRouter.patch(
	ADMIN_ROUTES.UNBLOCK_RESTAURANT,
	adminAuthMiddleware,
	unblockRestaurantRateLimiter,
	validateRequestParams(unblockRestaurantParamSchema),
	adminRestaurantController.unblockRestaurant.bind(adminRestaurantController),
);

export default adminRouter;
