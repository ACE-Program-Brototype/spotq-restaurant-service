import { ContainerModule } from "inversify";
import type { IStaffInvitationConfig } from "@/application/ports/config/staff-invitation-config.port";
import type { IEmailQueuePort } from "@/application/ports/services/email-queue.port";
import type { IInvitationTokenService } from "@/application/ports/services/invitation-token.service.port";
import type { IOtpService } from "@/application/ports/services/otp-service.port";
import type { IPasswordHasher } from "@/application/ports/services/password-hasher.port";
import type { ITokenService } from "@/application/ports/services/token-service.port";
import type { IAcceptInvitationUseCase } from "@/application/ports/use-cases/accept-invitation.use-case.port";
import type { IForgotPasswordUseCase } from "@/application/ports/use-cases/forgot-password.use-case.port";
import type { IGetStaffProfileUseCase } from "@/application/ports/use-cases/get-staff-profile.use-case.port";
import type { IInviteStaffUseCase } from "@/application/ports/use-cases/invite-staff.use-case.port";
import type { IListStaffInvitationsUseCase } from "@/application/ports/use-cases/list-staff-invitations.use-case.port";
import type { ILoginStaffUseCase } from "@/application/ports/use-cases/login-staff.use-case.port";
import type { ILogoutStaffUseCase } from "@/application/ports/use-cases/logout-staff.use-case.port";
import type { IRefreshTokenUseCase } from "@/application/ports/use-cases/refresh-token.use-case.port";
import type { IResendForgotPasswordOtpUseCase } from "@/application/ports/use-cases/resend-forgot-password-otp.use-case.port";
import type { IResendStaffInvitationUseCase } from "@/application/ports/use-cases/resend-invitation.use-case.port";
import type { IResetPasswordUseCase } from "@/application/ports/use-cases/reset-password.use-case.port";
import type { IRevokeStaffInvitationUseCase } from "@/application/ports/use-cases/revoke-invitation.use-case.port";
import type { IValidateInvitationUseCase } from "@/application/ports/use-cases/validate-invitation.use-case.port";
import type { IVerifyForgotPasswordOtpUseCase } from "@/application/ports/use-cases/verify-forgot-password-otp.use-case.port";
import { AcceptInvitationUseCase } from "@/application/use-cases/staff/accept-invitation.use-case";
import { ForgotPasswordUseCase } from "@/application/use-cases/staff/forgot-password.use-case";
import { GetStaffProfileUseCase } from "@/application/use-cases/staff/get-staff-profile.use-case";
import { InviteStaffUseCase } from "@/application/use-cases/staff/invite-staff.use-case";
import { ListStaffInvitationsUseCase } from "@/application/use-cases/staff/list-staff-invitations.use-case";
import { LoginStaffUseCase } from "@/application/use-cases/staff/login-staff.use-case";
import { LogoutStaffUseCase } from "@/application/use-cases/staff/logout-staff.use-case";
import { RefreshTokenUseCase } from "@/application/use-cases/staff/refresh-token.use-case";
import { ResendForgotPasswordOtpUseCase } from "@/application/use-cases/staff/resend-forgot-password-otp.use-case";
import { ResendStaffInvitationUseCase } from "@/application/use-cases/staff/resend-staff-invitation.use-case";
import { ResetPasswordUseCase } from "@/application/use-cases/staff/reset-password.use-case";
import { RevokeStaffInvitationUseCase } from "@/application/use-cases/staff/revoke-staff-invitation.use-case";
import { ValidateInvitationUseCase } from "@/application/use-cases/staff/validate-invitation.use-case";
import { VerifyForgotPasswordOtpUseCase } from "@/application/use-cases/staff/verify-forgot-password-otp.use-case";
import { TYPES } from "@/config/di/types";
import { env } from "@/config/env";
import type { IOtpRepository } from "@/domain/repositories/otp.repository.interface";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface";
import type { IStaffInvitationRepository } from "@/domain/repositories/staff-invitation.repository.interface";
import type { ITokenRevocationRepository } from "@/domain/repositories/token-revocation.repository.interface";
import { PrismaRestaurantStaffRepository } from "@/infrastructure/database/repositories/prisma-restaurant-staff.repository";
import { PrismaStaffInvitationRepository } from "@/infrastructure/database/repositories/prisma-staff-invitation.repository";
import { RedisOtpRepository } from "@/infrastructure/database/repositories/redis-otp.repository";
import { RedisTokenRevocationRepository } from "@/infrastructure/database/repositories/redis-token-revocation.repository";
import { EmailQueueService } from "@/infrastructure/queue/email.queue";
import { BcryptPasswordHasher } from "@/infrastructure/services/bcrypt-password-hasher";
import { CryptoInvitationTokenService } from "@/infrastructure/services/crypto-invitation-token.service";
import { CryptoOtpService } from "@/infrastructure/services/crypto-otp.service";
import { JwtTokenService } from "@/infrastructure/services/jwt-token.service";
import { StaffController } from "@/presentation/http/controllers/staff.controller";

export const staffAuthModule = new ContainerModule(({ bind }) => {
	// Repositories
	bind<IRestaurantStaffRepository>(TYPES.RestaurantStaffRepository)
		.to(PrismaRestaurantStaffRepository)
		.inSingletonScope();

	bind<IStaffInvitationRepository>(TYPES.StaffInvitationRepository)
		.to(PrismaStaffInvitationRepository)
		.inSingletonScope();

	bind<ITokenRevocationRepository>(TYPES.TokenRevocationRepository)
		.to(RedisTokenRevocationRepository)
		.inSingletonScope();

	bind<IOtpRepository>(TYPES.OtpRepository)
		.to(RedisOtpRepository)
		.inSingletonScope();

	// Services
	bind<IPasswordHasher>(TYPES.PasswordHasher)
		.to(BcryptPasswordHasher)
		.inSingletonScope();

	bind<ITokenService>(TYPES.TokenService)
		.to(JwtTokenService)
		.inSingletonScope();

	bind<IInvitationTokenService>(TYPES.InvitationTokenService)
		.to(CryptoInvitationTokenService)
		.inSingletonScope();

	bind<IStaffInvitationConfig>(TYPES.StaffInvitationConfig).toConstantValue({
		tokenTtlHours: env.INVITATION_TOKEN_TTL_HOURS,
		frontendUrl: env.FRONTEND_URL,
		invitationAcceptPath: env.INVITATION_ACCEPT_PATH,
	});

	bind<IOtpService>(TYPES.OtpService).to(CryptoOtpService).inSingletonScope();

	bind<IEmailQueuePort>(TYPES.EmailQueuePort)
		.to(EmailQueueService)
		.inSingletonScope();

	// Use Cases
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

	bind<IInviteStaffUseCase>(TYPES.InviteStaffUseCase)
		.to(InviteStaffUseCase)
		.inSingletonScope();

	bind<IValidateInvitationUseCase>(TYPES.ValidateInvitationUseCase)
		.to(ValidateInvitationUseCase)
		.inSingletonScope();

	bind<IAcceptInvitationUseCase>(TYPES.AcceptInvitationUseCase)
		.to(AcceptInvitationUseCase)
		.inSingletonScope();

	bind<IResendStaffInvitationUseCase>(TYPES.ResendStaffInvitationUseCase)
		.to(ResendStaffInvitationUseCase)
		.inSingletonScope();

	bind<IRevokeStaffInvitationUseCase>(TYPES.RevokeStaffInvitationUseCase)
		.to(RevokeStaffInvitationUseCase)
		.inSingletonScope();

	bind<IListStaffInvitationsUseCase>(TYPES.ListStaffInvitationsUseCase)
		.to(ListStaffInvitationsUseCase)
		.inSingletonScope();

	bind<IGetStaffProfileUseCase>(TYPES.GetStaffProfileUseCase)
		.to(GetStaffProfileUseCase)
		.inSingletonScope();

	// Controller
	bind<StaffController>(TYPES.StaffController)
		.to(StaffController)
		.inSingletonScope();
});
