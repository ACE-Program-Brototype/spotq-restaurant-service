export interface GeneratedInvitationToken {
	rawToken: string;
	tokenHash: string;
}

export interface IInvitationTokenService {
	generateToken(bytes?: number): GeneratedInvitationToken;
	hashToken(rawToken: string): string;
}
