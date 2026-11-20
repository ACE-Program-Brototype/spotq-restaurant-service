import type {
	UpdateMenuItemVariantStatusInputDto,
	UpdateMenuItemVariantStatusOutputDto,
} from "@application/dtos/menu-item/menu-item-variant.dto";

export interface IUpdateMenuItemVariantStatusUseCase {
	execute(
		input: UpdateMenuItemVariantStatusInputDto,
	): Promise<UpdateMenuItemVariantStatusOutputDto>;
}
