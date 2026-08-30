import { ContainerModule } from "inversify";
import type { IForgotPasswordUseCase } from "@/application/ports/use-cases/forgot-password.use-case.port.ts";
import type { ILoginStaffUseCase } from "@/application/ports/use-cases/login-staff.use-case.port.ts";
import type { ILogoutStaffUseCase } from "@/application/ports/use-cases/logout-staff.use-case.port.ts";
import type { IRefreshTokenUseCase } from "@/application/ports/use-cases/refresh-token.use-case.port.ts";
import type { IResendForgotPasswordOtpUseCase } from "@/application/ports/use-cases/resend-forgot-password-otp.use-case.port.ts";
import type { IResetPasswordUseCase } from "@/application/ports/use-cases/reset-password.use-case.port.ts";
import type { IVerifyForgotPasswordOtpUseCase } from "@/application/ports/use-cases/verify-forgot-password-otp.use-case.port.ts";
import { ForgotPasswordUseCase } from "@/application/use-cases/staff/forgot-password.use-case.ts";
import { LoginStaffUseCase } from "@/application/use-cases/staff/login-staff.use-case.ts";
import { LogoutStaffUseCase } from "@/application/use-cases/staff/logout-staff.use-case.ts";
import { RefreshTokenUseCase } from "@/application/use-cases/staff/refresh-token.use-case.ts";
import { ResendForgotPasswordOtpUseCase } from "@/application/use-cases/staff/resend-forgot-password-otp.use-case.ts";
import { ResetPasswordUseCase } from "@/application/use-cases/staff/reset-password.use-case.ts";
import { VerifyForgotPasswordOtpUseCase } from "@/application/use-cases/staff/verify-forgot-password-otp.use-case.ts";
import { TYPES } from "@/config/di/types.ts";

export const applicationModule = new ContainerModule(({ bind }) => {
	bind<ILoginStaffUseCase>(TYPES.LoginStaffUseCase)
		.to(LoginStaffUseCase)
		.inSingletonScope();

	bind<ILogoutStaffUseCase>(TYPES.LogoutStaffUseCase)
		.to(LogoutStaffUseCase)
		.inSingletonScope();

	bind<IRefreshTokenUseCase>(TYPES.RefreshTokenUseCase)
		.to(RefreshTokenUseCase)
		.inSingletonScope();

	bind<IForgotPasswordUseCase>(TYPES.ForgotPasswordUseCase)
		.to(ForgotPasswordUseCase)
		.inSingletonScope();

	bind<IVerifyForgotPasswordOtpUseCase>(TYPES.VerifyForgotPasswordOtpUseCase)
		.to(VerifyForgotPasswordOtpUseCase)
		.inSingletonScope();

	bind<IResendForgotPasswordOtpUseCase>(TYPES.ResendForgotPasswordOtpUseCase)
		.to(ResendForgotPasswordOtpUseCase)
		.inSingletonScope();

	bind<IResetPasswordUseCase>(TYPES.ResetPasswordUseCase)
		.to(ResetPasswordUseCase)
		.inSingletonScope();
});
