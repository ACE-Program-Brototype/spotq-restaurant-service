import type { DeleteTableInput } from "@application/dtos/table/delete-table.dto";

export interface IDeleteTableUseCase {
	execute(input: DeleteTableInput): Promise<void>;
}
