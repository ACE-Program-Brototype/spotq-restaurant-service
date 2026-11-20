import type {
	AddonResponseDto,
	CreateAddonInputDto,
} from "@/application/dtos/addon/create-addon.dto.ts";
import type { IUseCase } from "@/application/ports/use-cases/use-case.port.ts";

export interface ICreateAddonUseCase
	extends IUseCase<CreateAddonInputDto, AddonResponseDto> {}
