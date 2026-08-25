import { Container } from "inversify";
import { restaurantEmailVerificationModule } from "./modules/restaurant-email-verification.module";
import { commonModule } from "./modules/common.module";

const container = new Container();

container.load(
    commonModule,
    restaurantEmailVerificationModule
);

export { container };
