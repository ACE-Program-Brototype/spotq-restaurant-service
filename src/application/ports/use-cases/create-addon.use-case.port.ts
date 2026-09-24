import type {
	AddonResponseDto,
	CreateAddonInputDto,
} from "@/application/dtos/addon/create-addon.dto.ts";

export interface ICreateAddonUseCase {
	execute(dto: CreateAddonInputDto): Promise<AddonResponseDto>;
}
