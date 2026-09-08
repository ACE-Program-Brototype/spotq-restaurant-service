import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import type { IGeneratePresignedUrlUseCase } from "@/application/ports/use-case/generate-presigned-url.use-case.port";
import { TYPES } from "@/di/types";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
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
		const result = await this.generatePresignedUrlUseCase.execute(
			req.body,
		);

		return successResponse(
			res,
			"Presigned upload URL generated successfully.",
			HTTP_STATUS.SUCCESS,
			result,
		);
	}
}