import type {
	VerifyForgotPasswordOtpDTO,
	VerifyForgotPasswordOtpResponseDTO,
} from "@/application/dtos/staff/verify-forgot-password-otp.dto.ts";
import type { IUseCase } from "./use-case.port.ts";

export type IVerifyForgotPasswordOtpUseCase = IUseCase<
	VerifyForgotPasswordOtpDTO,
	VerifyForgotPasswordOtpResponseDTO
>;
