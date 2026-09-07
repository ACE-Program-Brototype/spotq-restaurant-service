import type { RestaurantAuthController } from "@/presentation/http/controllers/restaurant-auth.controller";
import { container } from "./container";
import { TYPES } from "./types";

export const restaurantAuthController = container.get<RestaurantAuthController>(
	TYPES.Controller.RestaurantAuthController,
);
