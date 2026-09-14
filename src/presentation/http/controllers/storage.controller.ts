import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import type { IGeneratePresignedUrlUseCase } from "@/application/ports/use-cases/generate-presigned-url.use-case.port";
import type { IGetPresignedUrlUseCase } from "@/application/ports/use-cases/get-presigned-url.use-case.port";
import { TYPES } from "@/config/di/types";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { messages } from "@/shared/constants/message.constants";
import { successResponse } from "@/utils/response.model";

@injectable()
export class StorageController {
	constructor(
		@inject(TYPES.UseCases.GeneratePresignedUrlUseCase)
		private readonly generatePresignedUrlUseCase: IGeneratePresignedUrlUseCase,
		@inject(TYPES.UseCases.GetPresignedUrlUseCase)
		private readonly getPresignedUrlUseCase: IGetPresignedUrlUseCase,
	) {}

	async generatePresignedUrl(
		req: Request,
		res: Response,
	): Promise<Response> {
		const userContext = (req as Request & { user?: { restaurantId?: string; email?: string } }).user;

		const result = await this.generatePresignedUrlUseCase.execute(
			req.body,
			userContext,
		);

		return successResponse(
			res,
			messages.PRESIGNED_URL_GENERATED_SUCCESS,
			HTTP_STATUS.SUCCESS,
			result,
		);
	}

	async getPresignedUrl(
		req: Request,
		res: Response,
	): Promise<Response> {
		const query = ((res.locals.query ?? req.query) as {
			key?: string;
			s3_object_key?: string;
			object_key?: string;
		});

		const key = (query.key || query.s3_object_key || query.object_key) as string;

		const result = await this.getPresignedUrlUseCase.execute({ key });

		return successResponse(
			res,
			messages.PRESIGNED_GET_URL_GENERATED_SUCCESS,
			HTTP_STATUS.SUCCESS,
			{
				downloadUrl: result.downloadUrl,
				download_url: result.downloadUrl,
				url: result.downloadUrl,
				expiresInSeconds: result.expiresInSeconds,
				expires_in_seconds: result.expiresInSeconds,
			},
		);
	}
}