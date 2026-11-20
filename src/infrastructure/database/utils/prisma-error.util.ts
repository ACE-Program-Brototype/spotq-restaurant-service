import { Prisma } from "@prisma/client";

/**
 * Safely extracts the target constraint string from a Prisma error.
 */
export function extractPrismaMetaTarget(error: unknown): string {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		const target = error.meta?.target;
		if (Array.isArray(target)) return target.join(",");
		if (typeof target === "string") return target;
	}
	const metaTarget = (error as { meta?: { target?: string[] | string } })?.meta
		?.target;
	if (Array.isArray(metaTarget)) return metaTarget.join(",");
	if (typeof metaTarget === "string") return metaTarget;
	return "";
}

/**
 * Safely extracts the foreign key field name from a Prisma error.
 */
export function extractPrismaFieldName(error: unknown): string {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		const field = error.meta?.field_name;
		if (typeof field === "string") return field;
	}
	const field = (error as { meta?: { field_name?: string } })?.meta?.field_name;
	return typeof field === "string" ? field : "";
}
