import bcrypt from "bcrypt";
import { injectable } from "inversify";

import type { IOtpHashService } from "@/application/ports/services/otp-hash.service.port";
import { env } from "@/config/env";

@injectable()
export class OtpHashService implements IOtpHashService {
	async hash(otp: string): Promise<string> {
		return bcrypt.hash(otp, env.BCRYPT_SALT_ROUNDS);
	}

	async compare(otp: string, hash: string): Promise<boolean> {
		return bcrypt.compare(otp, hash);
	}
}