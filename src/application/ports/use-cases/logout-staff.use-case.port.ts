import type { IUseCase } from "./use-case.port.ts";

export interface LogoutStaffDTO {
	refreshToken?: string;
}

export type ILogoutStaffUseCase = IUseCase<LogoutStaffDTO, void>;
