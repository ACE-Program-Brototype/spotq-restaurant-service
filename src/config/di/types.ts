export const TYPES = {
	// Database & Cache
	PrismaClient: Symbol.for("PrismaClient"),
	RedisClient: Symbol.for("RedisClient"),

	// Staff Repositories
	RestaurantStaffRepository: Symbol.for("RestaurantStaffRepository"),
	StaffInvitationRepository: Symbol.for("StaffInvitationRepository"),
	RestaurantRepository: Symbol.for("RestaurantRepository"),
	TokenRevocationRepository: Symbol.for("TokenRevocationRepository"),
	OtpRepository: Symbol.for("OtpRepository"),

	// Staff Services
	PasswordHasher: Symbol.for("PasswordHasher"),
	TokenService: Symbol.for("TokenService"),
	InvitationTokenService: Symbol.for("InvitationTokenService"),
	StaffInvitationConfig: Symbol.for("StaffInvitationConfig"),
	OtpService: Symbol.for("StaffOtpService"),
	EmailQueuePort: Symbol.for("EmailQueuePort"),

	// Staff Use Cases
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
	ListStaffInvitationsUseCase: Symbol.for("ListStaffInvitationsUseCase"),
	GetStaffProfileUseCase: Symbol.for("GetStaffProfileUseCase"),

	// Staff Controllers & Services
	StaffController: Symbol.for("StaffController"),
	JWKSController: Symbol.for("JWKSController"),
	JWKService: Symbol.for("JWKService"),

	// Observability & System
	HealthCheckService: Symbol.for("HealthCheckService"),

	// Feature Namespaced Sub-types (for Restaurant & Storage & Common services)
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
		GeneratePresignedUrlUseCase: Symbol.for("GeneratePresignedUrlUseCase"),
	},

	Controller: {
		RestaurantAuthController: Symbol.for("RestaurantAuthController"),
		StorageController: Symbol.for("StorageController"),
	},

	Database: {
		PrismaClient: Symbol.for("PrismaClient"),
	},

	Repositories: {
		RestaurantRepository: Symbol.for("RestaurantRepository"),
	},

	Redis: {
		Client: Symbol.for("RedisClient"),
	},

	Services: {
		OtpStore: Symbol.for("RedisOtpStore"),
		Brevo_Email: Symbol.for("BrevoEmail"),
		OtpService: Symbol.for("RestaurantOtpService"),
		EmailVerification: Symbol.for("EmailVerification"),
		AuthTokenService: Symbol.for("AuthTokenService"),
		OtpHashService: Symbol.for("OtpHashService"),
		Storage: Symbol.for("StorageService"),
		FilePolicyValidator: Symbol.for("FilePolicyValidator"),
	},

	Logger: {
		PinoClient: Symbol.for("Logger"),
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

export type ServiceTypes = typeof TYPES;
