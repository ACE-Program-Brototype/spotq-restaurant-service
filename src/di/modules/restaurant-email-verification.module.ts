import { ContainerModule } from "inversify";
import { TYPES } from "../types";
import { SendRestaurantEmailOtpUseCase } from "@/application/use-cases/restaurant-email-verification/send-email-otp.use-case";
import { RestaurantEmailVerificationController } from "@/presentation/http/controllers/restaurant-email-verification.controller";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import { RestaurantRepository } from "@/infrastructure/repositories/restaurant.repository";
import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/restaurant-email-verification/send-email-otp.use-case.port";
import type { IOtpStore } from "@/application/ports/services/otp-store.port";
import { RedisOtpStore } from "@/infrastructure/services/redis-otp-store.service";
import type { IEmailService } from "@/application/ports/services/email-service.interface";
import { BrevoEmailService } from "@/infrastructure/services/brevo-email.service";

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
	},
);
