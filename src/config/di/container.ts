import "reflect-metadata";
import { Container } from "inversify";
import { addonModule } from "./modules/addon.module";
import { adminModule } from "./modules/admin.module";
import { commonModule } from "./modules/common.module";
import { internalModule } from "./modules/internal.module";
import { menuModule } from "./modules/menu.module";
import { restaurantAuthModule } from "./modules/restaurant.auth.module";
import { restaurantModule } from "./modules/restaurant.module";
import { staffAuthModule } from "./modules/staff.auth.module";
import { storageModule } from "./modules/storage.module";
import { tableModule } from "./modules/table.module";
import { tableSectionModule } from "./modules/table-section.module";

export const container = new Container({
	defaultScope: "Singleton",
});

container.load(
	commonModule,
	restaurantAuthModule,
	restaurantModule,
	staffAuthModule,
	storageModule,
	adminModule,
	addonModule,
	menuModule,
	tableSectionModule,
	tableModule,
	internalModule,
);
