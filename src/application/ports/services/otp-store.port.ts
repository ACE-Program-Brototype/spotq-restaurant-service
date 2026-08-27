export interface IOtpStore {
	save(key: string, otp: string, expiresInSeconds: number): Promise<void>;

	get(key: string): Promise<string | null>;

	delete(key: string): Promise<void>;

	exists(key: string): Promise<boolean>;
}
