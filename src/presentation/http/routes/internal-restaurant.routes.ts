import express from "express";
import { internalRestaurantController } from "@/config/di/controllers.resolutions.ts";
import { INTERNAL_ROUTES } from "@/shared/constants/route.constants.ts";
import { internalS2SAuthMiddleware } from "../middleware/internal-s2s-auth.middleware.ts";
import { validateRequestParams } from "../middleware/validation.middleware.ts";
import { getMenuItemDetailsParamsSchema } from "../validators/get-menu-item-details.validator.ts";
import { validateRestaurantParamsSchema } from "../validators/internal/validate-restaurant.validator.ts";

export const internalRestaurantRouter = express.Router();

internalRestaurantRouter.use(internalS2SAuthMiddleware());

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

