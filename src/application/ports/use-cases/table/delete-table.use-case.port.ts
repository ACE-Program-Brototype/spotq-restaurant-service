import type { IDeleteTableInputDTO } from "@application/dtos/table/delete-table.dto";

export interface IDeleteTableUseCase {
	execute(input: IDeleteTableInputDTO): Promise<void>;
}
