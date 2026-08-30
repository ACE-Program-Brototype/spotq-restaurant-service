import { ContainerModule } from "inversify";
import type { IEmailQueuePort } from "@/application/ports/services/email-queue.port.ts";
import type { IOtpService } from "@/application/ports/services/otp-service.port.ts";
import type { IPasswordHasher } from "@/application/ports/services/password-hasher.port.ts";
import type { ITokenService } from "@/application/ports/services/token-service.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { EmailQueueService } from "@/infrastructure/queue/email.queue.ts";
import { BcryptPasswordHasher } from "@/infrastructure/services/bcrypt-password-hasher.ts";
import { CryptoOtpService } from "@/infrastructure/services/crypto-otp.service.ts";
import { JwtTokenService } from "@/infrastructure/services/jwt-token.service.ts";

export const servicesModule = new ContainerModule(({ bind }) => {
	bind<IPasswordHasher>(TYPES.PasswordHasher)
		.to(BcryptPasswordHasher)
		.inSingletonScope();
	bind<ITokenService>(TYPES.TokenService)
		.to(JwtTokenService)
		.inSingletonScope();
	bind<IOtpService>(TYPES.OtpService).to(CryptoOtpService).inSingletonScope();
	bind<IEmailQueuePort>(TYPES.EmailQueuePort)
		.to(EmailQueueService)
		.inSingletonScope();
});
