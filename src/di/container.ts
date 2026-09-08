import { Container } from "inversify";
import { restaurantAuthModule } from "./modules/restaurant-auth.module";
import { commonModule } from "./modules/common.module";
import { restaurantOnboardModule } from "./modules/restaurant-onboard.module";

const container = new Container();

container.load(commonModule, restaurantAuthModule, restaurantOnboardModule);

export { container };
