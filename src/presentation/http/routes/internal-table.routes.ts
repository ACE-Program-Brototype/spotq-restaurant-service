import { internalTableController } from "@config/di/controllers.resolutions";
import { internalS2SAuthMiddleware } from "@presentation/http/middleware/internal-s2s-auth.middleware";

import { INTERNAL_ROUTES } from "@shared/constants/route.constants";
import { Router } from "express";
import {
	validateRequestBody,
	validateRequestParams,
} from "../middleware/validation.middleware";
import {
	assignTableBodySchema,
	assignTableParamsSchema,
} from "../validators/internal/assign-table.validator";
import {
	releaseTableBodySchema,
	releaseTableParamsSchema,
} from "../validators/internal/release-table.validator";

export const internalTableRouter = Router();

internalTableRouter.patch(
	INTERNAL_ROUTES.RELEASE_TABLE,
	internalS2SAuthMiddleware(),
	validateRequestParams(releaseTableParamsSchema),
	validateRequestBody(releaseTableBodySchema),
	internalTableController.releaseTable,
);

internalTableRouter.patch(
	INTERNAL_ROUTES.ASSIGN_TABLE,
	internalS2SAuthMiddleware(),
	validateRequestParams(assignTableParamsSchema),
	validateRequestBody(assignTableBodySchema),
	internalTableController.assignTable,
);
