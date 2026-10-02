import type { DeleteMenuItemInputDto } from "@/application/dtos/menu-item/delete-menu-item.dto.ts";

export interface IDeleteMenuItemUseCase {
	execute(input: DeleteMenuItemInputDto): Promise<void>;
}
