import type { RestaurantEmailVerificationController } from "@/presentation/http/controllers/restaurant-email-verification.controller";
import { container } from "./container";
import type { RestaurantRegistrationController } from "@/presentation/http/controllers/restaurant-registeration.controller";
import { TYPES } from "./types";


export const restaurantEmailVerificationController =
    container.get<RestaurantEmailVerificationController>(
        TYPES.Controller.RestaurantEmailVerificationController,
    );

export const restaurantRegistrationController =
    container.get<RestaurantRegistrationController>(
        TYPES.Controller.RestaurantRegistrationController,
    );