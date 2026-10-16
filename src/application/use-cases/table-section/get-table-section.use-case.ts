import type {
	GetTableSectionInputDTO,
	GetTableSectionOutputDTO,
} from "@application/dtos/table-section/get-table-section.dto";
import type { IGetTableSectionUseCase } from "@application/ports/use-cases/table-section/get-table-section.use-case.port";
import { TYPES } from "@config/di/types";
import { TABLE_SECTION_MODE } from "@domain/constants/table-section.constants";
import { RestaurantNotFoundError } from "@domain/errors/restaurant.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { ITableSectionRepository } from "@domain/repositories/table-section.respository.interface";
import { inject } from "inversify";

export class GetTableSectionUseCase implements IGetTableSectionUseCase {
	constructor(
		@inject(TYPES.Repositories.TableSectionRepository)
		private readonly tableSectionRepo: ITableSectionRepository,
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepo: IRestaurantRepository,
	) {}

	async execute(
		dto: GetTableSectionInputDTO,
	): Promise<GetTableSectionOutputDTO> {
		const { restaurantId, userId, page, mode, limit } = dto;
		const restaurant = await this.restaurantRepo.findById(restaurantId);
		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		// ensures the user have admin access to the restaurant
		restaurant.ensureAdminAccess(userId);

		// If
		if (mode === TABLE_SECTION_MODE.ALL) {
			const sections =
				await this.tableSectionRepo.findAllByRestaurantId(restaurantId);

			return {
				mode: TABLE_SECTION_MODE.ALL,
				sections: sections.map((sec) => ({
					id: sec.id,
					name: sec.sectionName,
				})),
			};
		}

		const result = await this.tableSectionRepo.findManyWithFilter({
			restaurantId,
			page: page ? Number(page) : 1,
			limit: limit ? Number(limit) : 10,
			sortBy: "createdAt",
			sortOrder: "desc",
		});

		return {
			mode: TABLE_SECTION_MODE.PAGINATED,
			sections: result.tableSections.map((sec) => ({
				id: sec.id,
				name: sec.sectionName,
			})),
			total: result.total,
		};
	}
}
