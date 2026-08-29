export const TYPES = {
	UseCases: {
		SendRestaurantEmailOtpUseCase: Symbol.for("SendRestaurantEmailOtpUseCase"),
		ResendRestaurantEmailOtpUseCase: Symbol.for(
			"ResendRestaurantEmailOtpUseCase",
		),
		VerifyRestaurantEmailOtpUseCase: Symbol.for(
			"VerifyRestaurantEmailOtpUseCase",
		),
		OnboardRestaurantUseCase: Symbol.for("OnboardRestaurantUseCase"),
	},

	Controller: {
		RestaurantAuthController: Symbol.for("RestaurantAuthController"),
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
		Brevo_Email: Symbol.for("BrevoEmail"),
		OtpService: Symbol.for("OtpService"),
		EmailVerification: Symbol.for("EmailVerification"),
		AuthTokenService: Symbol.for("AuthTokenService"),
		OtpHashService: Symbol.for("OtpHashService"),
	},

	Logger: {
		PinoClient: Symbol.for("PinoClient"),
	},

	Brevo: {
		Client: Symbol.for("BrevoClient"),
	},

	Queue: {
		Email: Symbol.for("EmailQueue"),
	},

	Worker: {
		EMAIL: Symbol.for("EmailWorker"),
	},
} as const;
