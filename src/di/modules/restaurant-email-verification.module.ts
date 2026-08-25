import { ContainerModule } from "inversify";
import { TYPES } from "../types";
import { SendRestaurantEmailOtpUseCase } from "@/application/use-cases/restaurant-email-verification/send-email-otp.use-case";
import { RestaurantEmailVerificationController } from "@/presentation/http/controllers/restaurant-email-verification.controller";

export const restaurantEmailVerificationModule =
  new ContainerModule(({ bind }) => {

    bind(TYPES.Controller.RestaurantEmailVerificationController)
    .to(RestaurantEmailVerificationController)

    bind(TYPES.UseCases.SendRestaurantEmailOtpUseCase)
    .to(SendRestaurantEmailOtpUseCase);

});