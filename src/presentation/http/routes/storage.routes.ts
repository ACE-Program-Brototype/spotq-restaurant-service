import express from "express";
import { authenticate } from "@presentation/http/middleware/auth.middleware";
import { validate } from "@presentation/http/middleware/validation.middleware";
import { storageController } from "@/di/controllers.resolutions";
import { generatePresignedUrlSchema } from "@presentation/http/validators/generate-presigned-url.validator";
import { STORAGE_ROUTES } from "@shared/constants/route.constants";

export const storageRouter = express.Router();

storageRouter.post(
	STORAGE_ROUTES.PRESIGNED_URL,
	authenticate,
	validate(generatePresignedUrlSchema),
	storageController.generatePresignedUrl.bind(storageController),
);