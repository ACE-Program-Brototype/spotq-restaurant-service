import { ContainerModule } from "inversify";
import { TYPES } from "../types";
import { PasswordService } from "@/infrastructure/services/password.service";
import type { IPasswordService } from "@/application/ports/services/password.service.port";
import { IRegisterRestaurantUseCase } from "@/application/ports/use-case/register-restaurant.use-case.port";
import { RegisterRestaurantUseCase } from "@/application/use-cases/register-restaurant.use-case";
import { RestaurantRegistrationController } from "@/presentation/http/controllers/restaurant-registeration.controller";


export const restaurantRegisterationModule = new ContainerModule(({ bind }) => {

    bind<IPasswordService>(TYPES.Services.PasswordService).to(PasswordService);

    bind<IRegisterRestaurantUseCase>(TYPES.UseCases.RegisterRestaurantUseCase).to(RegisterRestaurantUseCase);

    bind(TYPES.Controller.RestaurantRegistrationController).to(RestaurantRegistrationController);
});