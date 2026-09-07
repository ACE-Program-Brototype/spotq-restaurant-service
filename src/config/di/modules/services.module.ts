import type { IJwkService } from "@application/ports/services/IJwk.service";
import { JwksService } from "@infrastructure/services/jwk.service";
import { ContainerModule } from "inversify";
import type { IStaffInvitationConfig } from "@/application/ports/config/staff-invitation-config.port.ts";
import type { IEmailQueuePort } from "@/application/ports/services/email-queue.port.ts";
import type { IInvitationTokenService } from "@/application/ports/services/invitation-token.service.port.ts";
import type { IOtpService } from "@/application/ports/services/otp-service.port.ts";
import type { IPasswordHasher } from "@/application/ports/services/password-hasher.port.ts";
import type { ITokenService } from "@/application/ports/services/token-service.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { env } from "@/config/env.ts";
import { EmailQueueService } from "@/infrastructure/queue/email.queue.ts";
import { BcryptPasswordHasher } from "@/infrastructure/services/bcrypt-password-hasher.ts";
import { CryptoInvitationTokenService } from "@/infrastructure/services/crypto-invitation-token.service.ts";
import { CryptoOtpService } from "@/infrastructure/services/crypto-otp.service.ts";
import { JwtTokenService } from "@/infrastructure/services/jwt-token.service.ts";

export const servicesModule = new ContainerModule(({ bind }) => {
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
	bind<IJwkService>(TYPES.JWKService).to(JwksService).inSingletonScope();
});
