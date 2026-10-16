import type {
	IGetTableInputDTO,
	IGetTablesGroupedOutputDTO,
	IGetTablesOutputDTO,
} from "@application/dtos/table/get-table.dto";

export interface IGetTableUseCase {
	execute(
		dto: IGetTableInputDTO,
	): Promise<IGetTablesOutputDTO | IGetTablesGroupedOutputDTO>;
}
