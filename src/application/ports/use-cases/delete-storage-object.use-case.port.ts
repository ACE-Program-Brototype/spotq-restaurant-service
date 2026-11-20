import type { DeleteStorageObjectDto } from "@/application/dtos/restaurant/delete-storage-object.dto";
import type { AuthContext } from "@/shared/types/auth.types";

export interface IDeleteStorageObjectUseCase {
	execute(
		dto: DeleteStorageObjectDto,
		authContext?: AuthContext,
	): Promise<void>;
}
