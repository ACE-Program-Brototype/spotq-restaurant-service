import { ContainerModule } from "inversify";

import { TYPES } from "../types";

// Controllers
import { RestaurantAuthController } from "@/presentation/http/controllers/restaurant-auth.controller";

// Use Cases
import { SendRestaurantEmailOtpUseCase } from "@/application/use-cases/send-email-otp.use-case";
import { VerifyRestaurantEmailOtpUseCase } from "@/application/use-cases/verify-email-otp.use-case";
import { OnboardRestaurantUseCase } from "@/application/use-cases/onboard-restaurant.use-case";
import { ResendRestaurantEmailOtpUseCase } from "@/application/use-cases/resend-email-otp.use-case";

import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/send-email-otp.use-case.port";
import type { IVerifyRestaurantEmailOtpUseCase } from "@/application/ports/use-case/verify-email-otp.use-case.port";
import type { IOnboardRestaurantUseCase } from "@/application/ports/use-case/onboard-restaurant.use-case.port";
import type { IResendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/resend-email-otp.use-case.port";

// Repositories
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import { RestaurantRepository } from "@/infrastructure/repositories/restaurant.repository";

// Services
import type { IOtpStore } from "@/application/ports/services/otp-store.port";
import type { IEmailService } from "@/application/ports/services/email-service.port";
import type { IOtpService } from "@/application/ports/services/otp.service.port";
import type { IEmailVerificationService } from "@/application/ports/services/email-verification.service.port";


import { RedisOtpStore } from "@/infrastructure/services/redis-otp-store.service";
import { BrevoEmailService } from "@/infrastructure/services/brevo-email.service";
import { OtpService } from "@/infrastructure/services/otp.service";
import { EmailVerificationService } from "@/infrastructure/services/email-verification.service";
import type { IAuthTokenService } from "@/application/ports/services/auth-token.service.port";
import { AuthTokenService } from "@/infrastructure/services/auth-token.service";
import type { IOtpHashService } from "@/application/ports/services/otp-hash.service.port";
import { OtpHashService } from "@/infrastructure/services/otp-hash.service";


export const restaurantAuthModule = new ContainerModule(({ bind }) => {
	// Controller
	bind(TYPES.Controller.RestaurantAuthController).to(
		RestaurantAuthController,
	);

	// Use Cases
	bind<ISendRestaurantEmailOtpUseCase>(
		TYPES.UseCases.SendRestaurantEmailOtpUseCase,
	).to(SendRestaurantEmailOtpUseCase);

	bind<IResendRestaurantEmailOtpUseCase>(
		TYPES.UseCases.ResendRestaurantEmailOtpUseCase,
	).to(ResendRestaurantEmailOtpUseCase);

	bind<IVerifyRestaurantEmailOtpUseCase>(
		TYPES.UseCases.VerifyRestaurantEmailOtpUseCase,
	).to(VerifyRestaurantEmailOtpUseCase);

	bind<IOnboardRestaurantUseCase>(
		TYPES.UseCases.OnboardRestaurantUseCase,
	).to(OnboardRestaurantUseCase);

	// Repository
	bind<IRestaurantRepository>(
		TYPES.Repositories.RestaurantRepository,
	).to(RestaurantRepository);

	// Services
	bind<IOtpStore>(TYPES.Services.OtpStore).to(RedisOtpStore);

	bind<IEmailService>(TYPES.Services.Brevo_Email).to(
		BrevoEmailService,
	);

	bind<IOtpService>(TYPES.Services.OtpService).to(OtpService);

	bind<IEmailVerificationService>(
		TYPES.Services.EmailVerification,
	).to(EmailVerificationService);

	bind<IAuthTokenService>(
		TYPES.Services.AuthTokenService
	).to(AuthTokenService);

	bind<IOtpHashService>(
		TYPES.Services.OtpHashService
	).to(OtpHashService);
	
});