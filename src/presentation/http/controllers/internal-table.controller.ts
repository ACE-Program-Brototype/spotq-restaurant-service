import type { IAssignTableUseCase } from "@application/ports/use-cases/internal/assign-table.use-case.port";
import { TYPES } from "@config/di/types";
import { HTTP_STATUS } from "@shared/constants/http.constants";
import { messages } from "@shared/constants/message.constants";
import { sendSuccessResponse } from "@shared/response/api-response";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

@injectable()
export class InternalTableController {
	constructor(
		@inject(TYPES.UseCases.AssignTableUseCase)
		private readonly _assignTableUseCase: IAssignTableUseCase,
	) {}

	assignTable = async (req: Request, res: Response) => {
		const { restaurantId } = req.params as { restaurantId: string };

		const { tables } = req.body;
		console.log(restaurantId, '------------------------')
		await this._assignTableUseCase.execute({
			restaurantId,
			tables,
		});
		return sendSuccessResponse(
			res,
			null,
			messages.TABLE_ASSIGN_SUCCESS,
			HTTP_STATUS.OK,
		);
	};
}
