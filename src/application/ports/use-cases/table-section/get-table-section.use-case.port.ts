import type { GetTableSectionResponse } from "@application/dtos/table-section/get-table-section.dto";
import type { TableSectionMode } from "@domain/constants/table-section.constants";

export interface IGetTableSectionUseCase {
	execute(
		restaurantId: string,
		userId: string,
		mode: TableSectionMode,
		page: number,
		limit: number,
	): Promise<GetTableSectionResponse>;
}
