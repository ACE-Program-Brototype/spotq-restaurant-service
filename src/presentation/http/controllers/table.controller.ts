import type { ICreateTableInputDTO } from "@application/dtos/table/create-table.dto";
import type { IUpdateTableInputDto } from "@application/dtos/table/update-table.dto";
import { UnauthorizedEntityAccessError } from "@application/errors/unauthorized-entity-access.error";
import type { ICreateTableUseCase } from "@application/ports/use-cases/table/create-table.use-case.port";
import type { IUpdateTableUseCase } from "@application/ports/use-cases/table/update-table.use-case.port";
import { TYPES } from "@config/di/types";
import { HTTP_STATUS } from "@shared/constants/http.constants";
import { messages } from "@shared/constants/message.constants";
import { sendSuccessResponse } from "@shared/response/api-response";
import type { Request, Response } from "express";
import { inject } from "inversify";

export class TableController {
	constructor(
		@inject(TYPES.UseCases.CreateTableUseCase)
		private readonly _createTable: ICreateTableUseCase,
		@inject(TYPES.UseCases.UpdateTableUseCase)
		private readonly _updateTable: IUpdateTableUseCase,
	) {}

	createTable = async (req: Request, res: Response) => {
		const userId = req.userId;

		if (!userId) {
			throw new UnauthorizedEntityAccessError();
		}

		const { tableCode, tableType, capacity, sectionId } =
			req.body as ICreateTableInputDTO;
		const { restaurantId } = req.params as { restaurantId: string };

		const result = await this._createTable.execute({
			restaurantId,
			tableCode,
			tableType,
			sectionId,
			capacity,
			userId,
		});

		sendSuccessResponse(
			res,
			result,
			messages.TABLE_CREATE_SUCCESS,
			HTTP_STATUS.CREATED,
		);
	};

	updateTable = async (req: Request, res: Response) => {
		const userId = req.userId;
		if (!userId) {
			throw new UnauthorizedEntityAccessError();
		}
		const { tableId, restaurantId } = req.params as {
			tableId: string;
			restaurantId: string;
		};

		const { sectionId, tableCode, capacity, type } = req.body;

		const dto: IUpdateTableInputDto = {
			tableId,
			restaurantId,
			userId,
			sectionId,
			tableCode,
			capacity,
			type,
		};

		const table = await this._updateTable.execute(dto);

		sendSuccessResponse(
			res,
			{
				id: table.id,
				restaurantId: table.restaurantId,
				tableCode: table.tableCode,
				capacity: table.capacity,
				sectionId: table.sectionId,
				type: table.tableShape,
			},
			messages.TABLE_UPDATE_SUCCESS,
			HTTP_STATUS.OK,
		);
	};
}
