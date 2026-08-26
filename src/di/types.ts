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

	Redis: {
		Client: Symbol.for("Redis"),
	},

	Services: {
		OtpStore: Symbol.for("RedisOtpStore"),
	},

	Logger: {
		PinoClient: Symbol.for("PinoClient"),
	},

	Brevo: {
		Client: Symbol.for("BrevoClient"),
	},

	Queue:{
		Email: Symbol.for("EmailQueue")
	}
} as const;
