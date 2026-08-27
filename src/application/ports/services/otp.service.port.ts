export interface IOtpService {
	checkCooldown(email: string): Promise<boolean>;
}