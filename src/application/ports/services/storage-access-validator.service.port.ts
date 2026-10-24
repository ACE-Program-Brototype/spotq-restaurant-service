import type { AuthContext } from "@/shared/types/auth.types";

export interface IStorageAccessValidator {
	validateOwnership(normalizedKey: string, context?: AuthContext): void;
}
