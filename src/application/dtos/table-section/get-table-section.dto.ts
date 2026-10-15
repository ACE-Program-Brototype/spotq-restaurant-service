import type {
	TABLE_SECTION_MODE,
	TableSectionMode,
} from "@domain/constants/table-section.constants";

export interface GetTableSectionInputDTO {
	restaurantId: string;
	userId: string;
	mode: TableSectionMode;
	page: number;
	limit: number;
}

export type GetTableSectionOutputDTO =
	| {
			mode: typeof TABLE_SECTION_MODE.ALL;
			sections: Array<{ id: string; name: string }>;
	  }
	| {
			mode: typeof TABLE_SECTION_MODE.PAGINATED;
			sections: Array<{ id: string; name: string }>;
			total: number;
	  };
