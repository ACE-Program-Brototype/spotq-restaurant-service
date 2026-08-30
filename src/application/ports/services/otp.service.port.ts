export interface IOtpService {
	checkSendRateLimit(email: string): Promise<boolean>;

	checkResendRateLimit(email: string): Promise<boolean>;

	resetAttempts(email: string): Promise<void>;

	incrementAttempt(email: string): Promise<number>;
}
