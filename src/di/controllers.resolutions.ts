import type { RestaurantAuthController } from "@/presentation/http/controllers/restaurant-auth.controller";
import type { RestaurantStatusController } from "@/presentation/http/controllers/restaurant-status.controller";
import { container } from "./container";
import { TYPES } from "./types";

export const restaurantAuthController = container.get<RestaurantAuthController>(
	TYPES.Controller.RestaurantAuthController,
);

export const restaurantStatusController =
	container.get<RestaurantStatusController>(
		TYPES.Controller.RestaurantStatusController,
	);
