import { Container } from "inversify";
import { restaurantAuthModule } from "./modules/restaurant-auth.module";
import { commonModule } from "./modules/common.module";
import { restaurantStorageModule } from "./modules/restaurant-storage.module";

const container = new Container();

container.load(commonModule, restaurantAuthModule, restaurantStorageModule);

export { container };
