import type { ICreateTableSectionInputDTO } from "@application/dtos/table-section/create-table-section.dto";
import { UnauthorizedEntityAccessError } from "@application/errors/unauthorized-entity-access.error";
import type { ICreateTableSectionUseCase } from "@application/ports/use-cases/table-section/create-table-section.use-case.port";
import type { IGetTableSectionUseCase } from "@application/ports/use-cases/table-section/get-table-section.use-case.port";
import { TYPES } from "@config/di/types";
import {
	TABLE_SECTION_MODE,
	type TableSectionMode,
} from "@domain/constants/table-section.constants";
import { HTTP_STATUS } from "@shared/constants/http.constants";
import { messages } from "@shared/constants/message.constants";
import { sendSuccessResponse } from "@shared/response/api-response";
import type { Request, Response } from "express";
import { inject } from "inversify";

export class TableSectionController {
	constructor(
		@inject(TYPES.UseCases.CreateTableSectionUseCase)
		private readonly _createTableSection: ICreateTableSectionUseCase,
		@inject(TYPES.UseCases.GetTableSectionUseCase)
		private readonly _getTableSection: IGetTableSectionUseCase,
	) {}

	createTableSection = async (req: Request, res: Response) => {
		const userId = req.userId;

		if (!userId) {
			throw new UnauthorizedEntityAccessError();
		}

		const { name } = req.body as ICreateTableSectionInputDTO;
		const { restaurantId } = req.params as { restaurantId: string };

		const result = await this._createTableSection.execute({
			restaurantId,
			name,
			userId,
		});

		sendSuccessResponse(
			res,
			result,
			messages.TABLE_SECTION_CREATE_SUCCESS,
			HTTP_STATUS.CREATED,
		);
	};

	getTableSection = async (req: Request, res: Response) => {
		const userId = req.userId;

		if (!userId) {
			throw new UnauthorizedEntityAccessError();
		}

		const { page, limit, mode } = req.query as {
			page?: number;
			limit?: number;
			mode?: TableSectionMode;
		};
		const { restaurantId } = req.params as { restaurantId: string };
		console.log(limit, "---------------------------")
		const result = await this._getTableSection.execute(
			restaurantId,
			userId,
			mode ?? TABLE_SECTION_MODE.ALL,
			page ? Number(page) : 1,
			limit ? Number(limit) : 10,
		);


		sendSuccessResponse(res, result, messages.TABLE_SECTION_GOT_SUCCESS);
	};
}
