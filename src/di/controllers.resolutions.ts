import { container } from "./container";
import type { RestaurantAuthController } from "@/presentation/http/controllers/restaurant-auth.controller";
import { TYPES } from "./types";

export const restaurantAuthController = container.get<RestaurantAuthController>(
	TYPES.Controller.RestaurantAuthController,
);
