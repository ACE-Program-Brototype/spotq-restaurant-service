import "reflect-metadata";

process.env.PORT = "3000";
process.env.DATABASE_URL =
	"postgresql://postgres:postgres@localhost:5432/spotq_test?schema=public";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.APP_ENV = "test";
process.env.LOG_LEVEL = "info";
process.env.JWT_ACCESS_SECRET = "test-jwt-access-secret-key-12345678";
process.env.JWT_ACCESS_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-key-12345678";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
