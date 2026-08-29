import { Container } from "inversify";
import { restaurantAuthModule } from "./modules/restaurant-auth.module";
import { commonModule } from "./modules/common.module";

const container = new Container();

container.load(commonModule, restaurantAuthModule);

export { container };
