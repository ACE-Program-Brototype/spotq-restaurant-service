import type { JwksController } from "@/presentation/http/controllers/jwks.controller";
import type { RestaurantAuthController } from "@/presentation/http/controllers/restaurant-auth.controller";
import type { StaffController } from "@/presentation/http/controllers/staff.controller";
import type { StorageController } from "@/presentation/http/controllers/storage.controller";
import { container } from "./container";
import { TYPES } from "./types";

export const restaurantAuthController = container.get<RestaurantAuthController>(
	TYPES.Controller.RestaurantAuthController,
);

export const storageController = container.get<StorageController>(
	TYPES.Controller.StorageController,
);

export const staffController = container.get<StaffController>(
	TYPES.StaffController,
);

export const jwksController = container.get<JwksController>(
	TYPES.JWKSController,
);
