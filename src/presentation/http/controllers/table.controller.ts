import type { ICreateTableInputDTO } from "@application/dtos/table/create-table.dto";
import type { IUpdateTableInputDto } from "@application/dtos/table/update-table.dto";
import { UnauthorizedEntityAccessError } from "@application/errors/unauthorized-entity-access.error";
import type { ICreateTableUseCase } from "@application/ports/use-cases/table/create-table.use-case.port";
<<<<<<< HEAD
import type { IUpdateTableUseCase } from "@application/ports/use-cases/table/update-table.use-case.port";
=======
import type { IGetTableUseCase } from "@application/ports/use-cases/table/get-table.usecase.port";
import type { IGetTableAvailabilityUseCase } from "@application/ports/use-cases/table/get-table-availability.use-case.port";
>>>>>>> development
import { TYPES } from "@config/di/types";
import type { TableStatusType } from "@domain/constants/table.constants";
import { HTTP_STATUS } from "@shared/constants/http.constants";
import { messages } from "@shared/constants/message.constants";
import { sendSuccessResponse } from "@shared/response/api-response";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

@injectable()
export class TableController {
	constructor(
		@inject(TYPES.UseCases.CreateTableUseCase)
		private readonly _createTable: ICreateTableUseCase,
<<<<<<< HEAD
		@inject(TYPES.UseCases.UpdateTableUseCase)
		private readonly _updateTable: IUpdateTableUseCase,
=======
		@inject(TYPES.UseCases.GetTableUseCase)
		private readonly _getTable: IGetTableUseCase,
		@inject(TYPES.UseCases.GetTableAvailabilityUseCase)
		private readonly _getTableAvailability: IGetTableAvailabilityUseCase,
>>>>>>> development
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

<<<<<<< HEAD
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
=======
	getTable = async (req: Request, res: Response) => {
		const userId = req.userId;

		if (!userId) {
			throw new UnauthorizedEntityAccessError();
		}

		const { restaurantId } = req.params as { restaurantId: string };

		const { page, limit, sectionId, status, minCapacity } = req.query as {
			page?: number;
			limit?: number;
			sectionId?: string;
			status?: TableStatusType;
			minCapacity?: number;
		};

		const result = await this._getTable.execute({
			restaurantId,
			userId,
			page: page ? Number(page) : 1,
			limit: limit ? Number(limit) : 10,
			...(typeof sectionId === "string" && { sectionId }),
			...(typeof status === "string" && { status }),
			...(typeof minCapacity === "string" && {
				minCapacity: Number(minCapacity),
			}),
		});

		sendSuccessResponse(
			res,
			result,
			messages.TABLE_FETCH_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	getAvailability = async (req: Request, res: Response) => {
		const { restaurantId } = req.params as { restaurantId: string };
		const partySize = Number(req.query.partySize);
		const result = await this._getTableAvailability.execute({
			restaurantId,
			partySize,
		});
		sendSuccessResponse(
			res,
			result,
			"Table availability checked",
>>>>>>> development
			HTTP_STATUS.OK,
		);
	};
}
