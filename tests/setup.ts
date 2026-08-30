import "reflect-metadata";

process.env.PORT = "3000";
process.env.DATABASE_URL =
	"postgresql://postgres:postgres@localhost:5432/spotq_test?schema=public";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.APP_ENV = "test";
process.env.LOG_LEVEL = "info";
process.env.AWS_ACCESS_KEY_ID = "test-aws-access-key-id";
process.env.AWS_SECRET_ACCESS_KEY = "test-aws-secret-access-key";
process.env.AWS_REGION = "us-east-1";
process.env.AWS_S3_BUCKET = "test-bucket";
process.env.BREVO_API_KEY = "test-brevo-api-key";
process.env.BREVO_SENDER_EMAIL = "noreply@spotq.com";
process.env.BREVO_SENDER_NAME = "SpotQ Test";
process.env.JWT_ACCESS_SECRET =
	"test-jwt-access-secret-key-1234567890123456789012345678901234567890";
process.env.JWT_ACCESS_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_SECRET =
	"test-jwt-refresh-secret-key-1234567890123456789012345678901234567890";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.BCRYPT_SALT_ROUNDS = "10";
