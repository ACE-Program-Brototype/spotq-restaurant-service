import { Container } from "inversify";
import { restaurantEmailVerificationModule } from "./modules/restaurant-email-verification.module";

const container = new Container();

container.load(restaurantEmailVerificationModule);

export { container };
