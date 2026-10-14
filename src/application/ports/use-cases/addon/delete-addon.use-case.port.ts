import type { DeleteAddonInputDto } from "@/application/dtos/addon/delete-addon.dto.ts";

export interface IDeleteAddonUseCase {
	execute(input: DeleteAddonInputDto): Promise<void>;
}
