import type { IAssignTableInputDTO } from "@application/dtos/internal/assign-table.dto";

export interface IAssignTableUseCase {
	execute(input: IAssignTableInputDTO): Promise<void>;
}
