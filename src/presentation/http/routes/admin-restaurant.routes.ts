import express from "express";
import { adminRestaurantController } from "@/config/di/controllers.resolutions.ts";
import { adminAuthMiddleware } from "@/presentation/http/middleware/admin.auth.middleware.ts";
import { validateRequestParams } from "@/presentation/http/middleware/validation.middleware.ts";
import { getRestaurantDetailsParamSchema } from "@/presentation/http/validators/admin/get-restaurant-details.validator.ts";
import { ADMIN_ROUTES } from "@/shared/constants/route.constants.ts";

export const adminRestaurantRouter = express.Router();

adminRestaurantRouter.get(
	ADMIN_ROUTES.GET_RESTAURANT_DETAILS,
	adminAuthMiddleware,
	validateRequestParams(getRestaurantDetailsParamSchema),
	adminRestaurantController.getRestaurantDetails,
);
