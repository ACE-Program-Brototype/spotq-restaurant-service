import { Container } from "inversify";
import { restaurantEmailVerificationModule } from "./modules/restaurant-email-verification.module";
import { commonModule } from "./modules/common.module";
import { restaurantRegisterationModule } from "./modules/restaurant-registeration.module";

const container = new Container();

container.load(
	commonModule,
	restaurantEmailVerificationModule,
	restaurantRegisterationModule,
);

export { container };
