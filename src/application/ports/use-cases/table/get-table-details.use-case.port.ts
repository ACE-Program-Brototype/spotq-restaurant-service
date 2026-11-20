import type {
	GetTableDetailsInputDTO,
	GetTableDetailsOutputDTO,
} from "@application/dtos/table/get-table-details.dto";

export interface IGetTableDetailsUseCase {
	execute(input: GetTableDetailsInputDTO): Promise<GetTableDetailsOutputDTO>;
}
