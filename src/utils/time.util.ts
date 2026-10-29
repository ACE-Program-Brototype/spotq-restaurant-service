export function formatTime(value: string | Date | null): string | null {
	if (value == null) return null;

	if (typeof value === "string") return value;

	return value.toISOString().slice(11, 19);
}