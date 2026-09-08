export const TYPES = {
	// Database & Repositories
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

	JWKSController: Symbol.for("JWKSController"),
	JWKService: Symbol.for("JWKService"),

	// Observability & System
	Logger: Symbol.for("Logger"),
	HealthCheckService: Symbol.for("HealthCheckService"),
} as const;

export type ServiceTypes = typeof TYPES;
