import { Container } from "inversify";
import { applicationModule } from "./modules/application.module";
import { commonModule } from "./modules/common.module";
import { databaseModule } from "./modules/database.module";
import { presentationModule } from "./modules/presentation.module";
import { restaurantAuthModule } from "./modules/restaurant-auth.module";
import { servicesModule } from "./modules/services.module";
import { systemModule } from "./modules/system.module";

const container = new Container({
	defaultScope: "Singleton",
});

container.load(
	commonModule,
	restaurantAuthModule,
	databaseModule,
	servicesModule,
	applicationModule,
	presentationModule,
	systemModule,
);

export { container };
