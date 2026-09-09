import express from "express";
import { validate } from "@presentation/http/middleware/validation.middleware";
import { storageController } from "@/di/controllers.resolutions";
import { generatePresignedUrlSchema } from "@presentation/http/validators/generate-presigned-url.validator";
import { STORAGE_ROUTES } from "@shared/constants/route.constants";

export const storageRouter = express.Router();

storageRouter.post(
	STORAGE_ROUTES.PRESIGNED_URL,
	validate(generatePresignedUrlSchema),
	storageController.generatePresignedUrl.bind(storageController),
);