import { ContainerModule } from "inversify";
import { TYPES } from "../types";
import { SendRestaurantEmailOtpUseCase } from "@/application/use-cases/send-email-otp.use-case";
import { RestaurantEmailVerificationController } from "@/presentation/http/controllers/restaurant-email-verification.controller";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import { RestaurantRepository } from "@/infrastructure/repositories/restaurant.repository";
import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/send-email-otp.use-case.port";
import type { IOtpStore } from "@/application/ports/services/otp-store.port";
import { RedisOtpStore } from "@/infrastructure/services/redis-otp-store.service";
import type { IEmailService } from "@/application/ports/services/email-service.port";
import { BrevoEmailService } from "@/infrastructure/services/brevo-email.service";
import type { IVerifyRestaurantEmailOtpUseCase } from "@/application/ports/use-case/verify-email-otp.use-case.port";
import { VerifyRestaurantEmailOtpUseCase } from "@/application/use-cases/verify-email-otp.use-case";
import type { IOtpService } from "@/application/ports/services/otp.service.port";
import { OtpService } from "@/infrastructure/services/otp.service";
import type { IEmailVerificationService } from "@/application/ports/services/email-verification.service.port";
import { EmailVerificationService } from "@/infrastructure/services/email-verification.service";

export const restaurantEmailVerificationModule = new ContainerModule(
	({ bind }) => {
		bind(TYPES.Controller.RestaurantEmailVerificationController).to(
			RestaurantEmailVerificationController,
		);

		bind<ISendRestaurantEmailOtpUseCase>(
			TYPES.UseCases.SendRestaurantEmailOtpUseCase,
		).to(SendRestaurantEmailOtpUseCase);

		bind<IRestaurantRepository>(TYPES.Repositories.RestaurantRepository).to(
			RestaurantRepository,
		);

		bind<IOtpStore>(TYPES.Services.OtpStore).to(RedisOtpStore);

		bind<IEmailService>(TYPES.Services.Brevo_Email).to(BrevoEmailService);

		bind<IVerifyRestaurantEmailOtpUseCase>(
			TYPES.UseCases.VerifyRestaurantEmailOtpUseCase,
		).to(VerifyRestaurantEmailOtpUseCase);

		bind<IOtpService>(TYPES.Services.OtpService).to(OtpService);

		bind<IEmailVerificationService>(TYPES.Services.EmailVerification).to(
			EmailVerificationService,
		);
	},
);
