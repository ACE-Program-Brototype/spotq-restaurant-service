import type { ForgotPasswordDTO } from "@/application/dtos/staff/forgot-password.dto.ts";
import type { IUseCase } from "./use-case.port.ts";

export type IForgotPasswordUseCase = IUseCase<ForgotPasswordDTO, void>;
