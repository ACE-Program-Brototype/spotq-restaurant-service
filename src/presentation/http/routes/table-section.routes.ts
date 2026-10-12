import { tableSectionController } from "@config/di/controllers.resolutions";
import { TABLE_SECTION_ROUTES } from "@shared/constants/route.constants";
import { Router } from "express";
import { restaurantOwnerAuthMiddleware } from "../middleware/restaurant-owner.auth.middleware";
import {
	validateRequestBody,
	validateRequestParams,
} from "../middleware/validation.middleware";
import {
	createTableSectionBodySchema,
	createTableSectionParamsSchema,
} from "../validators/table-sections/create-table-sections.validator";

export const tableSectionRoutes = Router();

tableSectionRoutes.post(
	TABLE_SECTION_ROUTES.CREATE_TABLE_SECTION,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(createTableSectionParamsSchema),
	validateRequestBody(createTableSectionBodySchema),
	tableSectionController.createTableSection,
);
