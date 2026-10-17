import type {
	IUpdateTableStatusInputDTO,
	IUpdateTableStatusOutputDTO,
} from "@application/dtos/table/update-table-status.dto";

export interface IUpdateTableStatusUseCase {
	execute(
		input: IUpdateTableStatusInputDTO,
	): Promise<IUpdateTableStatusOutputDTO>;
}
