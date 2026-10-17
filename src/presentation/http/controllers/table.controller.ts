import type { ICreateTableInputDTO } from "@application/dtos/table/create-table.dto";
import type { IUpdateTableInputDto } from "@application/dtos/table/update-table.dto";
import { UnauthorizedEntityAccessError } from "@application/errors/unauthorized-entity-access.error";
import type { ICreateTableUseCase } from "@application/ports/use-cases/table/create-table.use-case.port";
import type { IDeleteTableUseCase } from "@application/ports/use-cases/table/delete-table.use-case.port";
import type { IGetTableUseCase } from "@application/ports/use-cases/table/get-table.usecase.port";
import type { IGetTableAvailabilityUseCase } from "@application/ports/use-cases/table/get-table-availability.use-case.port";
import type { IUpdateTableUseCase } from "@application/ports/use-cases/table/update-table.use-case.port";
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
		private readonly _createTableUseCase: ICreateTableUseCase,
		@inject(TYPES.UseCases.UpdateTableUseCase)
		private readonly _updateTableUseCase: IUpdateTableUseCase,
		@inject(TYPES.UseCases.GetTableUseCase)
		private readonly _getTableUseCase: IGetTableUseCase,
		@inject(TYPES.UseCases.GetTableAvailabilityUseCase)
		private readonly _getTableAvailabilityUseCase: IGetTableAvailabilityUseCase,
		@inject(TYPES.UseCases.DeleteTableUseCase)
		private readonly _deleteTableUseCase: IDeleteTableUseCase,
	) {}

	createTable = async (req: Request, res: Response) => {
		const userId = req.userId;

		if (!userId) {
			throw new UnauthorizedEntityAccessError();
		}

		const { tableCode, tableType, capacity, sectionId } =
			req.body as ICreateTableInputDTO;
		const { restaurantId } = req.params as { restaurantId: string };

		const result = await this._createTableUseCase.execute({
			restaurantId,
			tableCode,
			tableType,
			sectionId,
			capacity,
			userId,
		});

		return sendSuccessResponse(
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

		const table = await this._updateTableUseCase.execute(dto);

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
		);
	};

	getTable = async (req: Request, res: Response) => {
		const userId = req.userId;

		if (!userId) {
			throw new UnauthorizedEntityAccessError();
		}

		const { restaurantId } = req.params as { restaurantId: string };

		const { page, limit, sectionId, status, minCapacity } = req.query as {
			page?: string;
			limit?: string;
			sectionId?: string;
			status?: TableStatusType;
			minCapacity?: string;
		};

		const result = await this._getTableUseCase.execute({
			restaurantId,
			userId,
			page: page ? Number(page) : 1,
			limit: limit ? Number(limit) : 10,
			...(sectionId && { sectionId }),
			...(status && { status }),
			...(minCapacity !== undefined && {
				minCapacity: Number(minCapacity),
			}),
		});

		return sendSuccessResponse(
			res,
			result,
			messages.TABLE_FETCH_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	getAvailability = async (req: Request, res: Response) => {
		const { restaurantId } = req.params as { restaurantId: string };
		const partySize = Number(req.query.partySize);
		const result = await this._getTableAvailabilityUseCase.execute({
			restaurantId,
			partySize,
		});
		return sendSuccessResponse(
			res,
			result,
			"Table availability checked",
			HTTP_STATUS.OK,
		);
	};

	deleteTable = async (req: Request, res: Response) => {
		const userId = req.userId;
		if (!userId) {
			throw new UnauthorizedEntityAccessError();
		}

		const { restaurantId, tableId } = req.params as {
			restaurantId: string;
			tableId: string;
		};

		const response = await this._deleteTableUseCase.execute({
			restaurantId,
			tableId,
			userId,
		});

		return sendSuccessResponse(
			res,
			response,
			messages.TABLE_DELETE_SUCCESS,
			HTTP_STATUS.OK,
		);
	};
}
