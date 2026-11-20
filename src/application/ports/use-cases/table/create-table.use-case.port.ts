import type {
	ICreateTableInputDTO,
	ICreateTableOutputDTO,
} from "@application/dtos/table/create-table.dto";

export interface ICreateTableUseCase {
	execute(dto: ICreateTableInputDTO): Promise<ICreateTableOutputDTO>;
}
