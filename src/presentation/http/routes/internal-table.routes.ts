import { internalTableController } from "@config/di/controllers.resolutions";
import { INTERNAL_ROUTES } from "@shared/constants/route.constants";
import { Router } from "express";
import { internalS2SAuthMiddleware } from "../middleware/internal-s2s-auth.middleware";
import {
	validateRequestBody,
	validateRequestParams,
} from "../middleware/validation.middleware";
import {
	assignTableBodySchema,
	assignTableParamsSchema,
} from "../validators/internal/assign-table.validator";

export const internalTableRoute = Router();

internalTableRoute.patch(
	INTERNAL_ROUTES.ASSIGN_TABLE,
	internalS2SAuthMiddleware(),
	validateRequestParams(assignTableParamsSchema),
	validateRequestBody(assignTableBodySchema),
	internalTableController.assignTable,
);
