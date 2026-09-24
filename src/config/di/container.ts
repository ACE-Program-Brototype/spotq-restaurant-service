import "reflect-metadata";
import { Container } from "inversify";
import { addonModule } from "./modules/addon.module";
import { adminModule } from "./modules/admin.module";
import { commonModule } from "./modules/common.module";
import { menuItemModule } from "./modules/menu-item.module";
import { menuModule } from "./modules/menu.module";
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
	adminModule,
	addonModule,
	menuItemModule,
	menuModule,
);
