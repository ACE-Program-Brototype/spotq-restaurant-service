import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import type { IGeneratePresignedUrlUseCase } from "@/application/ports/use-cases/generate-presigned-url.use-case.port";
import { TYPES } from "@/di/types";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { messages } from "@/shared/constants/message.constants";
import { successResponse } from "@/utils/response.model";

@injectable()
export class StorageController {
	constructor(
		@inject(TYPES.UseCases.GeneratePresignedUrlUseCase)
		private readonly generatePresignedUrlUseCase: IGeneratePresignedUrlUseCase,
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
}