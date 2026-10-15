import type { GetTableSectionResponse } from "@application/dtos/table-section/get-table-section.dto";
import type { IGetTableSectionUseCase } from "@application/ports/use-cases/table-section/get-table-section.use-case.port";
import {
	TABLE_SECTION_MODE,
	type TableSectionMode,
} from "@domain/constants/table-section.constants";
import { RestaurantNotFoundError } from "@domain/errors/restaurant.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { ITableSectionRepository } from "@domain/repositories/table-section.respository.interface";

export class GetTableSectionUseCase implements IGetTableSectionUseCase {
	constructor(
		private readonly tableSectionRepo: ITableSectionRepository,
		private readonly restaurantRepo: IRestaurantRepository,
	) {}

	async execute(
		restaurantId: string,
		userId: string,
		mode: TableSectionMode,
		page = 1,
		limit = 10,
	): Promise<GetTableSectionResponse> {
		const restaurant = await this.restaurantRepo.findById(restaurantId);
		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		restaurant.ensureAdminAccess(userId);

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
			page,
			limit,
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
