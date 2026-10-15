import express from "express";
import { internalRestaurantController } from "@/config/di/controllers.resolutions.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { INTERNAL_ROUTES } from "@/shared/constants/route.constants.ts";
import { internalS2SAuthMiddleware } from "../middleware/internal-s2s-auth.middleware.ts";
import { validateRequestParams } from "../middleware/validation.middleware.ts";
import { validateRestaurantParamsSchema } from "../validators/internal/validate-restaurant.validator.ts";

export const internalRestaurantRouter = express.Router();

internalRestaurantRouter.get(
	INTERNAL_ROUTES.RESTAURANT_VALIDATION,
	internalS2SAuthMiddleware(),
	validateRequestParams(
		validateRestaurantParamsSchema,
		HTTP_STATUS.BAD_REQUEST,
	),
	internalRestaurantController.validateRestaurant.bind(
		internalRestaurantController,
	),
);
