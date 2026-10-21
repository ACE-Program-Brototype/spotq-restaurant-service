import { internalTableController } from "@config/di/controllers.resolutions";
import { internalS2SAuthMiddleware } from "@presentation/http/middleware/internal-s2s-auth.middleware";
import { INTERNAL_ROUTES } from "@shared/constants/route.constants";
import { Router } from "express";
import {
	validateRequestBody,
	validateRequestParams,
} from "../middleware/validation.middleware";
import {
	releaseTableBodySchema,
	releaseTableParamsSchema,
} from "../validators/internal/release-table.validator";

export const internalTableRoute = Router();

internalTableRoute.patch(
	INTERNAL_ROUTES.RELEASE_TABLE,
	internalS2SAuthMiddleware(),
	validateRequestParams(releaseTableParamsSchema),
	validateRequestBody(releaseTableBodySchema),
	internalTableController.releaseTable,
);
