import express from "express";
import { internalRestaurantController } from "@/config/di/controllers.resolutions.ts";
import { internalS2SAuthMiddleware } from "@/presentation/http/middleware/internal-s2s-auth.middleware.ts";
import {
	validateRequestBody,
	validateRequestParams,
} from "@/presentation/http/middleware/validation.middleware.ts";
import { getMenuItemDetailsParamsSchema } from "@/presentation/http/validators/get-menu-item-details.validator.ts";
import { getBatchRestaurantsBodySchema } from "@/presentation/http/validators/internal/get-batch-restaurants.validator.ts";
import { validateRestaurantParamsSchema } from "@/presentation/http/validators/internal/validate-restaurant.validator.ts";
import { INTERNAL_ROUTES } from "@/shared/constants/route.constants.ts";

export const internalRestaurantRouter = express.Router();

internalRestaurantRouter.use(internalS2SAuthMiddleware());

internalRestaurantRouter.post(
	INTERNAL_ROUTES.RESTAURANTS_BATCH,
	validateRequestBody(getBatchRestaurantsBodySchema),
	internalRestaurantController.getBatchRestaurants,
);

internalRestaurantRouter.get(
	INTERNAL_ROUTES.RESTAURANT_VALIDATION,
	validateRequestParams(validateRestaurantParamsSchema),
	internalRestaurantController.validateRestaurant,
);

internalRestaurantRouter.get(
	INTERNAL_ROUTES.MENU_ITEM_DETAIL,
	validateRequestParams(getMenuItemDetailsParamsSchema),
	internalRestaurantController.getMenuItemDetails,
);
