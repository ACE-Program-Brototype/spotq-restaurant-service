import type { IUpdateTableInputDto } from "@application/dtos/table/update-table.dto";
import type { Table } from "@domain/entities/table.entity";

export interface IUpdateTableUseCase {
	execute(dto: IUpdateTableInputDto): Promise<Table>;
}
