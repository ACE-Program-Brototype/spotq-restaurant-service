import type {
	IDeleteTableSectionInputDTO,
	IDeleteTableSectionOutputDTO,
} from "@application/dtos/table-section/delete-table-section.dto";

export interface IDeleteTableSectionUseCase {
	execute(
		input: IDeleteTableSectionInputDTO,
	): Promise<IDeleteTableSectionOutputDTO>;
}
