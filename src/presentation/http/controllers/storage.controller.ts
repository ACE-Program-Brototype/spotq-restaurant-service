import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { IGeneratePresignedUrlUseCase } from "@/application/ports/use-cases/generate-presigned-url.use-case.port.ts";
import type { IGetPresignedUrlUseCase } from "@/application/ports/use-cases/get-presigned-url.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class StorageController {
	constructor(
		@inject(TYPES.UseCases.GeneratePresignedUrlUseCase)
		private readonly generatePresignedUrlUseCase: IGeneratePresignedUrlUseCase,
		@inject(TYPES.UseCases.GetPresignedUrlUseCase)
		private readonly getPresignedUrlUseCase: IGetPresignedUrlUseCase,
	) {}

	async generatePresignedUrl(req: Request, res: Response): Promise<Response> {
		const userContext = (
			req as Request & { user?: { restaurantId?: string; email?: string } }
		).user;

		const result = await this.generatePresignedUrlUseCase.execute(
			req.body,
			userContext,
		);

		return sendSuccessResponse(
			res,
			result,
			messages.PRESIGNED_URL_GENERATED_SUCCESS,
			HTTP_STATUS.SUCCESS,
		);
	}

	async getPresignedUrl(req: Request, res: Response): Promise<Response> {
		const query = (res.locals.query ?? req.query) as { key: string };

		const result = await this.getPresignedUrlUseCase.execute({
			key: query.key,
		});

		return sendSuccessResponse(
			res,
			{
				download_url: result.downloadUrl,
				expires_in_seconds: result.expiresInSeconds,
			},
			messages.PRESIGNED_GET_URL_GENERATED_SUCCESS,
			HTTP_STATUS.SUCCESS,
		);
	}
}
