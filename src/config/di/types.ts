export const TYPES = {
	// Database & Repositories
	PrismaClient: Symbol.for("PrismaClient"),
	RestaurantStaffRepository: Symbol.for("RestaurantStaffRepository"),

	// Security & Ports
	PasswordHasher: Symbol.for("PasswordHasher"),
	TokenService: Symbol.for("TokenService"),

	// Use Cases
	LoginStaffUseCase: Symbol.for("LoginStaffUseCase"),
	LogoutStaffUseCase: Symbol.for("LogoutStaffUseCase"),

	// Controllers
	LoginStaffController: Symbol.for("LoginStaffController"),
	LogoutStaffController: Symbol.for("LogoutStaffController"),

	// Observability & System
	Logger: Symbol.for("Logger"),
	HealthCheckService: Symbol.for("HealthCheckService"),
} as const;

export type ServiceTypes = typeof TYPES;
