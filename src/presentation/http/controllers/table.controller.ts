import type { ICreateTableInputDTO } from "@application/dtos/table/create-table.dto";
import { UnauthorizedEntityAccessError } from "@application/errors/unauthorized-entity-access.error";
import type { ICreateTableUseCase } from "@application/ports/use-cases/table/create-table.use-case.port";
import type { IGetTableUseCase } from "@application/ports/use-cases/table/get-table.usecase.port";
import type { IGetTableAvailabilityUseCase } from "@application/ports/use-cases/table/get-table-availability.use-case.port";
import type { IUpdateTableStatusUseCase } from "@application/ports/use-cases/table/update-table-status.use-case.port";
import { TYPES } from "@config/di/types";
import type { TableStatusType } from "@domain/constants/table.constants";
import { HTTP_STATUS } from "@shared/constants/http.constants";
import { messages } from "@shared/constants/message.constants";
import { sendSuccessResponse } from "@shared/response/api-response";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type {
	UpdateTableStatusBody,
	UpdateTableStatusParams,
} from "../validators/table/update-table-status.validator";

@injectable()
export class TableController {
	constructor(
		@inject(TYPES.UseCases.CreateTableUseCase)
		private readonly _createTable: ICreateTableUseCase,
		@inject(TYPES.UseCases.GetTableUseCase)
		private readonly _getTable: IGetTableUseCase,
		@inject(TYPES.UseCases.GetTableAvailabilityUseCase)
		private readonly _getTableAvailability: IGetTableAvailabilityUseCase,
		@inject(TYPES.UseCases.UpdateTableStatusUseCase)
		private readonly _updateTableStatusUseCase: IUpdateTableStatusUseCase,
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
			HTTP_STATUS.OK,
		);
	};

	updateTableStatus = async (req: Request, res: Response) => {
		const userId = req.userId;

		if (!userId) {
			throw new UnauthorizedEntityAccessError();
		}

		const { status } = req.body as UpdateTableStatusBody;
		const { restaurantId, tableId } = req.params as UpdateTableStatusParams;

		const result = await this._updateTableStatusUseCase.execute({
			status,
			userId,
			tableId,
			restaurantId,
		});

		return sendSuccessResponse(
			res,
			result,
			messages.TABLE_STATUS_UPDATE_SUCCESS,
			HTTP_STATUS.OK,
		);
	};
}
