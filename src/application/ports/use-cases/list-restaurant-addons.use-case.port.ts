import type { AddonResponseDto } from "@/application/dtos/addon/create-addon.dto.ts";
import type { IUseCase } from "@/application/ports/use-cases/use-case.port.ts";

export interface IListRestaurantAddonsUseCase
	extends IUseCase<string, AddonResponseDto[]> {}
