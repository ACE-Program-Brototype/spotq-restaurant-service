export const TYPES = {
	UseCases: {
		SendRestaurantEmailOtpUseCase: Symbol.for("SendRestaurantEmailOtpUseCase"),
		ResendRestaurantEmailOtpUseCase: Symbol.for(
			"ResendRestaurantEmailOtpUseCase",
		),
		VerifyRestaurantEmailOtpUseCase: Symbol.for(
			"VerifyRestaurantEmailOtpUseCase",
		),
		RefreshRestaurantAccessTokenUseCase: Symbol.for(
			"RefreshRestaurantAccessTokenUseCase",
		),
		OnboardRestaurantUseCase: Symbol.for("OnboardRestaurantUseCase"),
		GetRestaurantStatusUseCase: Symbol.for("GetRestaurantStatusUseCase"),
		ActivateSubscriptionUseCase: Symbol.for("ActivateSubscriptionUseCase"),
	},

	Controller: {
		RestaurantAuthController: Symbol.for("RestaurantAuthController"),
		RestaurantStatusController: Symbol.for("RestaurantStatusController"),
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
		SubscriptionExpiryService: Symbol.for("SubscriptionExpiryService"),
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
