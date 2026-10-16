import type {
	GetTableSectionInputDTO,
	GetTableSectionOutputDTO,
} from "@application/dtos/table-section/get-table-section.dto";

export interface IGetTableSectionUseCase {
	execute(dto: GetTableSectionInputDTO): Promise<GetTableSectionOutputDTO>;
}
