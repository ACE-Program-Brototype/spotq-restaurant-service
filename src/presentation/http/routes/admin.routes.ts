import express from "express";
import { container } from "@/config/di/container.ts";
import { TYPES } from "@/config/di/types.ts";
import type { AdminRestaurantController } from "@/presentation/http/controllers/admin-restaurant.controller.ts";
import { adminAuthMiddleware } from "@/presentation/http/middleware/admin.auth.middleware.ts";
import { validateRequestQuery } from "@/presentation/http/middleware/validation.middleware.ts";
import { listRestaurantsQuerySchema } from "@/presentation/http/validators/admin/list-restaurants.validator.ts";
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
