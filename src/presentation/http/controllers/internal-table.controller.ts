import type { IReleaseTableUseCase } from "@application/ports/use-cases/internal/release-table.use-case.port";
import { TYPES } from "@config/di/types";
import { HTTP_STATUS } from "@shared/constants/http.constants";
import { messages } from "@shared/constants/message.constants";
import { sendSuccessResponse } from "@shared/response/api-response";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

@injectable()
export class InternalTableController {
	constructor(
		@inject(TYPES.UseCases.ReleaseTableUseCase)
		private readonly _releaseTableUseCase: IReleaseTableUseCase,
	) {}

	releaseTable = async (req: Request, res: Response) => {
		const { restaurantId } = req.params as { restaurantId: string };

		const { tables } = req.body;
		await this._releaseTableUseCase.execute({
			restaurantId,
			tables,
		});
		return sendSuccessResponse(
			res,
			null,
			messages.TABLE_RELEASE_SUCCESS,
			HTTP_STATUS.OK,
		);
	};
}
