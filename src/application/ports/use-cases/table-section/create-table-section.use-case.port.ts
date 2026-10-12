import type { ICreateTableSectionInputDTO } from "@application/dtos/table-section/create-table-section.dto";

export interface ICreateTableSectionUseCase {
	execute(dto: ICreateTableSectionInputDTO): Promise<void>;
}
