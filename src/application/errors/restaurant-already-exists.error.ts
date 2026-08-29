export class RestaurantAlreadyExistsError extends Error {
	constructor() {
		super("Restaurant with this email already exists");
		this.name = "RestaurantAlreadyExistsError";
	}
}
