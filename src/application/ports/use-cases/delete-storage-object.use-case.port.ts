import type {
	DeleteStorageObjectDto,
	DeleteStorageObjectResponseDto,
} from "@/application/dtos/restaurant/delete-storage-object.dto";
import type { AuthContext } from "./generate-presigned-url.use-case.port";

export interface IDeleteStorageObjectUseCase {
	execute(
		dto: DeleteStorageObjectDto,
		authContext?: AuthContext,
	): Promise<DeleteStorageObjectResponseDto>;
}
