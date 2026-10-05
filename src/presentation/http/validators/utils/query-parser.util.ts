/**
 * Common query parameter preprocessor helpers for Zod validation schemas.
 */

export function parseOptionalString(val: unknown): unknown {
	if (val === undefined || val === null) return undefined;
	if (typeof val === "string") {
		const trimmed = val.trim();
		return trimmed === "" ? undefined : trimmed;
	}
	return val;
}

export function parseBooleanFilter(val: unknown): unknown {
	if (val === undefined || val === null) return undefined;
	if (typeof val === "boolean") return val;
	if (typeof val === "string") {
		const trimmed = val.trim().toLowerCase();
		if (trimmed === "") return undefined;
		if (trimmed === "true" || trimmed === "1") return true;
		if (trimmed === "false" || trimmed === "0") return false;
		return trimmed;
	}
	return val;
}
