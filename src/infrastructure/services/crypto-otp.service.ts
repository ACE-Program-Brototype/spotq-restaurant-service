import crypto from "node:crypto";
import { injectable } from "inversify";
import type { IOtpService } from "@/application/ports/services/otp-service.port.ts";

@injectable()
export class CryptoOtpService implements IOtpService {
	public generateOtp(length = 6): string {
		const min = 10 ** (length - 1);
		const max = 10 ** length - 1;
		return crypto.randomInt(min, max + 1).toString();
	}
}
