import { describe, expect, it } from "@jest/globals";
import { deleteStorageObjectSchema } from "@/presentation/http/validators/delete-storage-object.validator";

describe("deleteStorageObjectSchema", () => {
	it("validates when valid key is provided", () => {
		const result = deleteStorageObjectSchema.safeParse({
			key: "restaurants/123/documents/license.pdf",
		});

		expect(result.success).toBe(true);
	});

	it("validates when objectKey is provided instead of key", () => {
		const result = deleteStorageObjectSchema.safeParse({
			objectKey: "restaurants/123/images/logo.png",
		});

		expect(result.success).toBe(true);
	});

	it("fails when neither key nor objectKey is provided", () => {
		const result = deleteStorageObjectSchema.safeParse({});

		expect(result.success).toBe(false);
	});

	it("fails when key is empty string", () => {
		const result = deleteStorageObjectSchema.safeParse({
			key: "   ",
		});

		expect(result.success).toBe(false);
	});

	it("fails when key contains path traversal characters ('..')", () => {
		const result = deleteStorageObjectSchema.safeParse({
			key: "../private/secrets.txt",
		});

		expect(result.success).toBe(false);
	});

	it("fails when objectKey contains path traversal characters ('..')", () => {
		const result = deleteStorageObjectSchema.safeParse({
			objectKey: "restaurants/123/../../etc/passwd",
		});

		expect(result.success).toBe(false);
	});
});
