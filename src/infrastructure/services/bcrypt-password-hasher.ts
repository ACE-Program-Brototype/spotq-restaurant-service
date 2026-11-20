import bcrypt from "bcrypt";
import { injectable } from "inversify";
import type { IPasswordHasher } from "@/application/ports/services/password-hasher.port.ts";

@injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
	private readonly saltRounds = 10;

	public async hash(plainText: string): Promise<string> {
		return bcrypt.hash(plainText, this.saltRounds);
	}

	public async compare(
		plainText: string,
		hashedText: string,
	): Promise<boolean> {
		return bcrypt.compare(plainText, hashedText);
	}
}
