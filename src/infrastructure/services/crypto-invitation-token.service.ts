import crypto from "node:crypto";
import { injectable } from "inversify";
import type {
	GeneratedInvitationToken,
	IInvitationTokenService,
} from "@/application/ports/services/invitation-token.service.port.ts";

@injectable()
export class CryptoInvitationTokenService implements IInvitationTokenService {
	public generateToken(bytes = 32): GeneratedInvitationToken {
		const rawToken = crypto.randomBytes(bytes).toString("hex");
		const tokenHash = this.hashToken(rawToken);
		return { rawToken, tokenHash };
	}

	public hashToken(rawToken: string): string {
		return crypto.createHash("sha256").update(rawToken).digest("hex");
	}
}
