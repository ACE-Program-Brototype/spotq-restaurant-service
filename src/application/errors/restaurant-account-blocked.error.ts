export class RestaurantAccountBlockedError extends Error {
	constructor() {
		super("Restaurant account is blocked");
		this.name = "RestaurantAccountBlockedError";
	}
}
