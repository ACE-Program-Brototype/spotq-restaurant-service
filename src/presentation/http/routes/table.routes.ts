import { tableController } from "@config/di/controllers.resolutions";
import { TABLE_ROUTES } from "@shared/constants/route.constants";
import { Router } from "express";
import { restaurantOrStaffAuthMiddleware } from "../middleware/restaurant-or-staff.auth.middleware";
import { restaurantOwnerAuthMiddleware } from "../middleware/restaurant-owner.auth.middleware";
import {
	validateRequestBody,
	validateRequestParams,
	validateRequestQuery,
} from "../middleware/validation.middleware";
import {
	createTableBodySchema,
	createTableParamsSchema,
} from "../validators/table/create-table.validator";
import {
	getTableParamsSchema,
	getTableQuerySchema,
} from "../validators/table/get-table.validator";

export const tableRoutes = Router();

tableRoutes.post(
	TABLE_ROUTES.CREATE_TABLE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(createTableParamsSchema),
	validateRequestBody(createTableBodySchema),
	tableController.createTable,
);

tableRoutes.get(
	TABLE_ROUTES.TABLE,
	restaurantOrStaffAuthMiddleware,
	validateRequestParams(getTableParamsSchema),
	validateRequestQuery(getTableQuerySchema),
	tableController.createTable,
);


