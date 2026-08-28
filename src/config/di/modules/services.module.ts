import { ContainerModule } from "inversify";
import type { IPasswordHasher } from "@/application/ports/services/password-hasher.port.ts";
import type { ITokenService } from "@/application/ports/services/token-service.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { BcryptPasswordHasher } from "@/infrastructure/services/bcrypt-password-hasher.ts";
import { JwtTokenService } from "@/infrastructure/services/jwt-token.service.ts";

export const servicesModule = new ContainerModule((bind) => {
	bind<IPasswordHasher>(TYPES.PasswordHasher)
		.to(BcryptPasswordHasher)
		.inSingletonScope();
	bind<ITokenService>(TYPES.TokenService)
		.to(JwtTokenService)
		.inSingletonScope();
});
