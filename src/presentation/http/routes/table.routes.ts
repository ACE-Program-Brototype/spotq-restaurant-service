import { tableController } from "@config/di/controllers.resolutions";
import { TABLE_ROUTES } from "@shared/constants/route.constants";
import { Router } from "express";
import { restaurantOwnerAuthMiddleware } from "../middleware/restaurant-owner.auth.middleware";
import {
	validateRequestBody,
	validateRequestParams,
} from "../middleware/validation.middleware";
import {
	createTableBodySchema,
	createTableParamsSchema,
} from "../validators/table/create-table.validator";

export const tableRoutes = Router();

tableRoutes.post(
	TABLE_ROUTES.CREATE_TABLE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(createTableParamsSchema),
	validateRequestBody(createTableBodySchema),
	tableController.createTable,
);
