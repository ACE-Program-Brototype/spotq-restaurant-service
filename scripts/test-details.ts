import { container } from "../src/config/di/container.ts";
import { TYPES } from "../src/config/di/types.ts";
import type { IRestaurantRepository } from "../src/domain/repositories/restaurant.repository.interface.ts";

async function main() {
  const repo = container.get<IRestaurantRepository>(TYPES.RestaurantRepository);
  const result = await repo.findCustomerRestaurantDetails({
    restaurantId: "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    includeMenu: true,
  });
  console.log("RESULT_FOR_A1EE:", JSON.stringify(result, null, 2));
}

main().catch(console.error);
