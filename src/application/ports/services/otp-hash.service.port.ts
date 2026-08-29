export interface IOtpHashService {
	hash(otp: string): Promise<string>;
	compare(otp: string, hash: string): Promise<boolean>;
}