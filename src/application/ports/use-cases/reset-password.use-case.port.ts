import type { ResetPasswordDTO } from "@/application/dtos/staff/reset-password.dto.ts";
import type { IUseCase } from "./use-case.port.ts";

export type IResetPasswordUseCase = IUseCase<ResetPasswordDTO, void>;
