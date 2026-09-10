import "reflect-metadata";
import { Container } from "inversify";
import { commonModule } from "./modules/common.module";
import { restaurantAuthModule } from "./modules/restaurant.auth.module";
import { staffAuthModule } from "./modules/staff.auth.module";
import { storageModule } from "./modules/storage.module";

export const container = new Container({
	defaultScope: "Singleton",
});

container.load(
	commonModule,
	restaurantAuthModule,
	staffAuthModule,
	storageModule,
);
