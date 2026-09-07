export const TYPES = {
	PrismaClient: Symbol.for("PrismaClient"),
	RedisClient: Symbol.for("RedisClient"),
	RestaurantStaffRepository: Symbol.for("RestaurantStaffRepository"),
	StaffInvitationRepository: Symbol.for("StaffInvitationRepository"),
	RestaurantRepository: Symbol.for("RestaurantRepository"),
	TokenRevocationRepository: Symbol.for("TokenRevocationRepository"),
	OtpRepository: Symbol.for("OtpRepository"),

	PasswordHasher: Symbol.for("PasswordHasher"),
	TokenService: Symbol.for("TokenService"),
	InvitationTokenService: Symbol.for("InvitationTokenService"),
	StaffInvitationConfig: Symbol.for("StaffInvitationConfig"),
	OtpService: Symbol.for("OtpService"),
	EmailQueuePort: Symbol.for("EmailQueuePort"),

	LoginStaffUseCase: Symbol.for("LoginStaffUseCase"),
	LogoutStaffUseCase: Symbol.for("LogoutStaffUseCase"),
	RefreshTokenUseCase: Symbol.for("RefreshTokenUseCase"),
	ForgotPasswordUseCase: Symbol.for("ForgotPasswordUseCase"),
	VerifyForgotPasswordOtpUseCase: Symbol.for("VerifyForgotPasswordOtpUseCase"),
	ResendForgotPasswordOtpUseCase: Symbol.for("ResendForgotPasswordOtpUseCase"),
	ResetPasswordUseCase: Symbol.for("ResetPasswordUseCase"),
	InviteStaffUseCase: Symbol.for("InviteStaffUseCase"),
	ValidateInvitationUseCase: Symbol.for("ValidateInvitationUseCase"),
	AcceptInvitationUseCase: Symbol.for("AcceptInvitationUseCase"),
	ResendStaffInvitationUseCase: Symbol.for("ResendStaffInvitationUseCase"),
	RevokeStaffInvitationUseCase: Symbol.for("RevokeStaffInvitationUseCase"),

	StaffController: Symbol.for("StaffController"),

	JWKSController: Symbol.for("JWKSController"),
	JWKService: Symbol.for("JWKService"),

	Logger: Symbol.for("Logger"),
	HealthCheckService: Symbol.for("HealthCheckService"),
} as const;

export type ServiceTypes = typeof TYPES;
