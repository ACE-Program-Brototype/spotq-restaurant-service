import { tableSectionController } from "@config/di/controllers.resolutions";
import { TABLE_SECTION_ROUTES } from "@shared/constants/route.constants";
import { Router } from "express";
import { restaurantOwnerAuthMiddleware } from "../middleware/restaurant-owner.auth.middleware";
import {
	validateRequestBody,
	validateRequestParams,
	validateRequestQuery,
} from "../middleware/validation.middleware";
import {
	createTableSectionBodySchema,
	createTableSectionParamsSchema,
} from "../validators/table-sections/create-table-sections.validator";
import { deleteTableSectionParamsSchema } from "../validators/table-sections/delete-table-section.validator";
import {
	getTableSectionParamsSchema,
	getTableSectionQuerySchema,
} from "../validators/table-sections/get-table-sections.validator";

export const tableSectionRoutes = Router();

tableSectionRoutes.post(
	TABLE_SECTION_ROUTES.CREATE_TABLE_SECTION,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(createTableSectionParamsSchema),
	validateRequestBody(createTableSectionBodySchema),
	tableSectionController.createTableSection,
);

tableSectionRoutes.get(
	TABLE_SECTION_ROUTES.TABLE_SECTION,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(getTableSectionParamsSchema),
	validateRequestQuery(getTableSectionQuerySchema),
	tableSectionController.getTableSection,
);

tableSectionRoutes.delete(
	TABLE_SECTION_ROUTES.TABL_SECTION_ID,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(deleteTableSectionParamsSchema),
	tableSectionController.deleteTableSection,
);
