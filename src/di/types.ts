export const TYPES = {
	UseCases: {
		SendRestaurantEmailOtpUseCase: Symbol.for("SendRestaurantEmailOtpUseCase"),
	},

	Controller: {
		RestaurantEmailVerificationController: Symbol.for(
			"RestaurantEmailVerificationController",
		),
	},
} as const;
