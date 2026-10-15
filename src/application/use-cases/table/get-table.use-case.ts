import type {
	IGetTableInputDTO,
	IGetTablesGroupedOutputDTO,
	IGetTablesOutputDTO,
} from "@application/dtos/table/get-table.dto";
import type { IGetTableUseCase } from "@application/ports/use-cases/table/get-table.usecase.port";
import { TYPES } from "@config/di/types";
import { RestaurantNotFoundError } from "@domain/errors/restaurant.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { ITableRepository } from "@domain/repositories/table.repository.interface";
import { inject } from "inversify";

export class GetTableUseCase implements IGetTableUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepo: IRestaurantRepository,
		@inject(TYPES.Repositories.TableRepository)
		private readonly tableRepo: ITableRepository,
	) {}
	async execute(
		dto: IGetTableInputDTO,
	): Promise<IGetTablesOutputDTO | IGetTablesGroupedOutputDTO> {
		const { restaurantId, userId, page, limit, mode } = dto;
		const restaurant = await this.restaurantRepo.findById(restaurantId);

		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		restaurant.ensureAdminAccess(userId);

		if (mode === TABLE_MODE.ADMIN) {
			const { table, total } = await this.tableRepo.findManyWithFilter({
				restaurantId,
				page,
				limit,
				sortBy: "createdAt",
				sortOrder: "desc",
			});

			return {
				tables: table.map((t) => ({
					id: t.id,
					tableCode: t.tableCode,
					capacity: t.capacity,
					status: t.status,
					sectionId: t.sectionId,
					tableShape: t.tableShape,
					sectionName: t.sectionName,
				})),
				total,
			};
		}

		const sections = await this.tableRepo.findAllGroupedBySection(restaurantId);

		return { sections };
	}
}
