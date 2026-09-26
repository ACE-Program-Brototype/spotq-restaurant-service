import type { AddonResponseDto } from "@/application/dtos/addon/create-addon.dto.ts";
import type { UpdateAddonInputDto } from "@/application/dtos/addon/update-addon.dto.ts";
import type { IUseCase } from "@/application/ports/use-cases/use-case.port.ts";

export interface IUpdateAddonUseCase
	extends IUseCase<UpdateAddonInputDto, AddonResponseDto> {}
