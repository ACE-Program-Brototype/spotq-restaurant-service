import { ContainerModule } from "inversify";
import { TYPES } from "../types";
import { SendRestaurantEmailOtpUseCase } from "@/application/use-cases/restaurant-email-verification/send-email-otp.use-case";
import { RestaurantEmailVerificationController } from "@/presentation/http/controllers/restaurant-email-verification.controller";
import { prisma } from "@/config/prisma";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import { RestaurantRepository } from "@/infrastructure/repositories/restaurant.repository";
import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/restaurant-email-verification/send-email-otp.use-case.port";
import type { PrismaClient } from "@prisma/client/extension";

export const restaurantEmailVerificationModule = new ContainerModule(
	({ bind }) => {
		bind(TYPES.Controller.RestaurantEmailVerificationController).to(
			RestaurantEmailVerificationController,
		);

		bind<PrismaClient>(TYPES.Database.PrismaClient).toConstantValue(prisma);

		bind<ISendRestaurantEmailOtpUseCase>(
			TYPES.UseCases.SendRestaurantEmailOtpUseCase,
		).to(SendRestaurantEmailOtpUseCase);
		bind<IRestaurantRepository>(TYPES.Repositories.RestaurantRepository).to(
			RestaurantRepository,
		);
	},
);
