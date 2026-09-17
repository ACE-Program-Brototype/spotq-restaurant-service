import express from "express";
import { storageController } from "@/config/di/controllers.resolutions.ts";
import { storageAuthMiddleware } from "@/presentation/http/middleware/storage.auth.middleware.ts";
import {
	validate,
	validateRequestQuery,
} from "@/presentation/http/middleware/validation.middleware.ts";
import { generatePresignedUrlSchema } from "@/presentation/http/validators/generate-presigned-url.validator.ts";
import { getPresignedUrlQuerySchema } from "@/presentation/http/validators/get-presigned-url.validator.ts";
import { STORAGE_ROUTES } from "@/shared/constants/route.constants.ts";

export const storageRouter = express.Router();

storageRouter.post(
	STORAGE_ROUTES.PRESIGNED_URL,
	storageAuthMiddleware,
	validate(generatePresignedUrlSchema),
	storageController.generatePresignedUrl.bind(storageController),
);

storageRouter.get(
	STORAGE_ROUTES.PRESIGNED_URL,
	storageAuthMiddleware,
	validateRequestQuery(getPresignedUrlQuerySchema),
	storageController.getPresignedUrl.bind(storageController),
);
