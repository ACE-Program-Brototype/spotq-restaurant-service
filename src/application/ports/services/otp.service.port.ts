export interface IOtpService {
	checkCooldown(email: string): Promise<boolean>;

	resetAttempts(email: string): Promise<void>;

	incrementAttempt(email: string): Promise<number>;
}
