export interface IOtpRepository {
	saveOtp(email: string, otp: string, ttlSeconds?: number): Promise<void>;
	getOtp(email: string): Promise<string | null>;
	verifyOtp(email: string, otp: string): Promise<boolean>;
	deleteOtp(email: string): Promise<void>;
}
