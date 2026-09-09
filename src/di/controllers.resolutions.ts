import type { RestaurantAuthController } from "@/presentation/http/controllers/restaurant-auth.controller";
import { container } from "./container";
import { TYPES } from "./types";
import type { StorageController } from "@presentation/http/controllers/storage.controller";

export const restaurantAuthController = container.get<RestaurantAuthController>(
	TYPES.Controller.RestaurantAuthController,
);

export const storageController = container.get<StorageController>(
	TYPES.Controller.StorageController
);
