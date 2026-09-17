import express from "express";
import { container } from "@/config/di/container.ts";
import { TYPES } from "@/config/di/types.ts";
import type { AdminRestaurantController } from "@/presentation/http/controllers/admin-restaurant.controller.ts";
import { adminAuthMiddleware } from "@/presentation/http/middleware/admin.auth.middleware.ts";
import {
	blockRestaurantRateLimiter,
	unblockRestaurantRateLimiter,
} from "@/presentation/http/middleware/rate-limiter.middleware.ts";
import {
	validateRequestBody,
	validateRequestParams,
	validateRequestQuery,
} from "@/presentation/http/middleware/validation.middleware.ts";
import {
	blockRestaurantBodySchema,
	blockRestaurantParamSchema,
} from "@/presentation/http/validators/admin/block-restaurant.validator.ts";
import { getRestaurantDetailsParamSchema } from "@/presentation/http/validators/admin/get-restaurant-details.validator.ts";
import { listRestaurantsQuerySchema } from "@/presentation/http/validators/admin/list-restaurants.validator.ts";
import { unblockRestaurantParamSchema } from "@/presentation/http/validators/admin/unblock-restaurant.validator.ts";
import { ADMIN_ROUTES } from "@/shared/constants/route.constants.ts";

export const adminRouter = express.Router();

const adminRestaurantController = container.get<AdminRestaurantController>(
	TYPES.Controller.AdminRestaurantController,
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
