export const TYPES = {
	// Database & Repositories
	PrismaClient: Symbol.for("PrismaClient"),
	RedisClient: Symbol.for("RedisClient"),
	RestaurantStaffRepository: Symbol.for("RestaurantStaffRepository"),
	TokenRevocationRepository: Symbol.for("TokenRevocationRepository"),

	// Security & Ports
	PasswordHasher: Symbol.for("PasswordHasher"),
	TokenService: Symbol.for("TokenService"),

	// Use Cases
	LoginStaffUseCase: Symbol.for("LoginStaffUseCase"),
	LogoutStaffUseCase: Symbol.for("LogoutStaffUseCase"),

	// Controllers
	StaffController: Symbol.for("StaffController"),

	// Observability & System
	Logger: Symbol.for("Logger"),
	HealthCheckService: Symbol.for("HealthCheckService"),
} as const;

export type ServiceTypes = typeof TYPES;
