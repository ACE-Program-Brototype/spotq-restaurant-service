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
		OtpService: Symbol.for("RestaurantOtpService"),
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

	// Database & Repositories (Flat aliases for Staff & System)
	PrismaClient: Symbol.for("PrismaClient"),
	RedisClient: Symbol.for("RedisClient"),
	RestaurantStaffRepository: Symbol.for("RestaurantStaffRepository"),
	TokenRevocationRepository: Symbol.for("TokenRevocationRepository"),
	OtpRepository: Symbol.for("OtpRepository"),

	// Security, Queue & Ports
	PasswordHasher: Symbol.for("PasswordHasher"),
	TokenService: Symbol.for("TokenService"),
	OtpService: Symbol.for("OtpService"),
	EmailQueuePort: Symbol.for("EmailQueuePort"),

	// Use Cases
	LoginStaffUseCase: Symbol.for("LoginStaffUseCase"),
	LogoutStaffUseCase: Symbol.for("LogoutStaffUseCase"),
	RefreshTokenUseCase: Symbol.for("RefreshTokenUseCase"),
	ForgotPasswordUseCase: Symbol.for("ForgotPasswordUseCase"),
	VerifyForgotPasswordOtpUseCase: Symbol.for("VerifyForgotPasswordOtpUseCase"),
	ResendForgotPasswordOtpUseCase: Symbol.for("ResendForgotPasswordOtpUseCase"),
	ResetPasswordUseCase: Symbol.for("ResetPasswordUseCase"),

	// Controllers
	StaffController: Symbol.for("StaffController"),

	// Observability & System
	HealthCheckService: Symbol.for("HealthCheckService"),
} as const;

export type ServiceTypes = typeof TYPES;
