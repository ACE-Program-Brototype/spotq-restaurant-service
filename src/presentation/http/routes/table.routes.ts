import { tableController } from "@config/di/controllers.resolutions";
import { env } from "@config/env";
import { TABLE_ROUTES } from "@shared/constants/route.constants";
import { authMiddleware } from "@spotq-org/s2s-core";
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
import { getTableAvailabilityQuerySchema } from "../validators/table/get-table.validator";

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

tableRoutes.get(
	TABLE_ROUTES.INTERNAL.AVAILABILITY,
	authMiddleware({
		expectedAudience: "queue-service",
		publicKeys: {
			"order-service": env.ORDER_SERVICE_PUBLIC_KEY,
			"restaurant-service": env.RESTAURANT_SERVICE_PUBLIC_KEY,
			"queue-service": env.QUEUE_SERVICE_PUBLIC_KEY,
		},
	}),
	validateRequestParams(getTableParamsSchema),
	validateRequestQuery(getTableAvailabilityQuerySchema),
	tableController.getAvailability,
);
