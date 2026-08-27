export interface IEmailVerificationService {
	createVerificationToken(email: string): Promise<string>;

	getVerifiedEmail(token: string): Promise<string | null>;

	deleteVerificationToken(token: string): Promise<void>;
}
