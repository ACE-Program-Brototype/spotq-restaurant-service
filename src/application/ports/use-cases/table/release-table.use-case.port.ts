import type {
	ReleaseTableInputDTO,
	ReleaseTableResponseDTO,
} from "@application/dtos/table/release-table.dto";

export interface IReleaseTableUseCase {
	execute(input: ReleaseTableInputDTO): Promise<ReleaseTableResponseDTO>;
}
