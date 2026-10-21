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
import { deleteTableParamsSchema } from "../validators/table/delete-table.validator";
import {
	getTableAvailabilityQuerySchema,
	getTableParamsSchema,
	getTableQuerySchema,
} from "../validators/table/get-table.validator";
import {
	updateTableBodySchema,
	updateTableParamsSchema,
} from "../validators/table/update-table.validator";
import {
	updateTableStatusBodySchema,
	updateTableStatusParamsSchema,
} from "../validators/table/update-table-status.validator";

export const tableRoutes = Router();

tableRoutes.post(
	TABLE_ROUTES.CREATE_TABLE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(createTableParamsSchema),
	validateRequestBody(createTableBodySchema),
	tableController.createTable,
);

tableRoutes.patch(
	TABLE_ROUTES.UPDATE_TABLE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(updateTableParamsSchema),
	validateRequestBody(updateTableBodySchema),
	tableController.updateTable,
);

tableRoutes.get(
	TABLE_ROUTES.TABLE,
	restaurantOrStaffAuthMiddleware,
	validateRequestParams(getTableParamsSchema),
	validateRequestQuery(getTableQuerySchema),
	tableController.getTable,
);

tableRoutes.get(
	TABLE_ROUTES.INTERNAL.AVAILABILITY,
	authMiddleware({
		expectedAudience: "restaurant-service",
		publicKeys: {
			"queue-service": env.QUEUE_S2S_PUBLIC_KEY,
		},
	}),
	validateRequestParams(getTableParamsSchema),
	validateRequestQuery(getTableAvailabilityQuerySchema),
	tableController.getAvailability,
);

tableRoutes.patch(
	TABLE_ROUTES.UPDATE_STATUS,
	restaurantOrStaffAuthMiddleware,
	validateRequestParams(updateTableStatusParamsSchema),
	validateRequestBody(updateTableStatusBodySchema),
	tableController.updateTableStatus,
);
tableRoutes.delete(
	TABLE_ROUTES.DELETE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(deleteTableParamsSchema),
	tableController.deleteTable,
);
