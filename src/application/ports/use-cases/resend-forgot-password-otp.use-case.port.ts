import type { ResendForgotPasswordOtpDTO } from "@/application/dtos/staff/resend-forgot-password-otp.dto.ts";
import type { IUseCase } from "./use-case.port.ts";

export type IResendForgotPasswordOtpUseCase = IUseCase<
	ResendForgotPasswordOtpDTO,
	void
>;
