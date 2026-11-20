import type {
	IReleaseTableInputDTO,
	IReleaseTableOutputDTO,
} from "@application/dtos/internal/release-table.dto";

export interface IReleaseTableUseCase {
	execute(input: IReleaseTableInputDTO): Promise<IReleaseTableOutputDTO>;
}
