import express from "express";
import { storageController } from "@/config/di/controllers.resolutions";
import { storageAuthMiddleware } from "@/presentation/http/middleware/storage.auth.middleware";
import {
	validate,
	validateRequestQuery,
} from "@/presentation/http/middleware/validation.middleware";
import { generatePresignedUrlSchema } from "@/presentation/http/validators/generate-presigned-url.validator";
import { getPresignedUrlQuerySchema } from "@/presentation/http/validators/get-presigned-url.validator";
import { STORAGE_ROUTES } from "@/shared/constants/route.constants";

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