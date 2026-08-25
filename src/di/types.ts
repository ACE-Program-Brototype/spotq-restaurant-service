export const TYPES = {
	UseCases: {
		SendRestaurantEmailOtpUseCase: Symbol.for("SendRestaurantEmailOtpUseCase"),
	},

	Controller: {
		RestaurantEmailVerificationController: Symbol.for(
			"RestaurantEmailVerificationController",
		),
	},

	Database: {
		PrismaClient: Symbol.for("PrismaClient"),
	},

	Repositories: {
		RestaurantRepository: Symbol.for("RestaurantRepository"),
	},
} as const;
