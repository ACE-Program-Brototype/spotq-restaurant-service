import express from "express";
import { adminRestaurantController } from "@/config/di/controllers.resolutions.ts";
import { adminAuthMiddleware } from "@/presentation/http/middleware/admin.auth.middleware.ts";
import {
	blockRestaurantRateLimiter,
	unblockRestaurantRateLimiter,
} from "@/presentation/http/middleware/rate-limiter.middleware.ts";
import {
	validateRequestBody,
	validateRequestParams,
} from "@/presentation/http/middleware/validation.middleware.ts";
import {
	blockRestaurantBodySchema,
	blockRestaurantParamSchema,
} from "@/presentation/http/validators/admin/block-restaurant.validator.ts";
import { getRestaurantDetailsParamSchema } from "@/presentation/http/validators/admin/get-restaurant-details.validator.ts";
import { unblockRestaurantParamSchema } from "@/presentation/http/validators/admin/unblock-restaurant.validator.ts";
import { ADMIN_ROUTES } from "@/shared/constants/route.constants.ts";

export const adminRestaurantRouter = express.Router();

adminRestaurantRouter.get(
	ADMIN_ROUTES.GET_RESTAURANT_DETAILS,
	adminAuthMiddleware,
	validateRequestParams(getRestaurantDetailsParamSchema),
	adminRestaurantController.getRestaurantDetails,
);

adminRestaurantRouter.patch(
	ADMIN_ROUTES.BLOCK_RESTAURANT,
	adminAuthMiddleware,
	blockRestaurantRateLimiter,
	validateRequestParams(blockRestaurantParamSchema),
	validateRequestBody(blockRestaurantBodySchema),
	adminRestaurantController.blockRestaurant,
);

adminRestaurantRouter.patch(
	ADMIN_ROUTES.UNBLOCK_RESTAURANT,
	adminAuthMiddleware,
	unblockRestaurantRateLimiter,
	validateRequestParams(unblockRestaurantParamSchema),
	adminRestaurantController.unblockRestaurant,
);
