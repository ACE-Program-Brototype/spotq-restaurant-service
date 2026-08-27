import bcrypt from "bcrypt";
import { injectable } from "inversify";
import type { IPasswordService } from "@/application/ports/services/password.service.port";
import { PASSWORD_CONFIG } from "@/shared/constants/password.constants";

@injectable()
export class PasswordService implements IPasswordService {
	async hash(password: string): Promise<string> {
		return bcrypt.hash(password, PASSWORD_CONFIG.SALT_ROUNDS);
	}

	async verify(password: string, passwordHash: string): Promise<boolean> {
		return bcrypt.compare(password, passwordHash);
	}
}
