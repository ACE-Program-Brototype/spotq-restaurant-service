import { Container } from "inversify";
import { commonModule } from "./modules/common.module";
import { restaurantAuthModule } from "./modules/restaurant-auth.module";

const container = new Container();

container.load(commonModule, restaurantAuthModule);

export { container };
