import type {
	RefreshTokenDTO,
	RefreshTokenResponseDTO,
} from "@/application/dtos/staff/refresh-token.dto.ts";
import type { IUseCase } from "./use-case.port.ts";

export type IRefreshTokenUseCase = IUseCase<
	RefreshTokenDTO,
	RefreshTokenResponseDTO
>;
