import { describe, expect, it } from "@jest/globals";
import {
	deleteStorageObjectQuerySchema,
	deleteStorageObjectSchema,
} from "@/presentation/http/validators/delete-storage-object.validator";
import { messages } from "@/shared/constants/message.constants";

describe("deleteStorageObjectSchema & deleteStorageObjectQuerySchema", () => {
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

	it("fails with centralized message when neither key nor objectKey is provided", () => {
		const result = deleteStorageObjectSchema.safeParse({});

		expect(result.success).toBe(false);
		if (!result.success) {
			const formatted = result.error.format();
			expect(
				formatted.key?._errors.includes(
					messages.STORAGE_KEY_OR_OBJECT_KEY_REQUIRED,
				),
			).toBe(true);
		}
	});

	it("fails when key is empty string", () => {
		const result = deleteStorageObjectSchema.safeParse({
			key: "   ",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			const formatted = result.error.format();
			expect(
				formatted.key?._errors.includes(messages.STORAGE_KEY_PARAM_REQUIRED),
			).toBe(true);
		}
	});

	it("fails with centralized message when key contains path traversal characters ('..')", () => {
		const result = deleteStorageObjectSchema.safeParse({
			key: "../private/secrets.txt",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			const formatted = result.error.format();
			expect(
				formatted.key?._errors.includes(
					messages.STORAGE_PATH_TRAVERSAL_NOT_ALLOWED,
				),
			).toBe(true);
		}
	});

	it("fails with centralized message when objectKey contains path traversal characters ('..')", () => {
		const result = deleteStorageObjectSchema.safeParse({
			objectKey: "restaurants/123/../../etc/passwd",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			const formatted = result.error.format();
			expect(
				formatted.key?._errors.includes(
					messages.STORAGE_PATH_TRAVERSAL_NOT_ALLOWED,
				),
			).toBe(true);
		}
	});

	it("works identically with deleteStorageObjectQuerySchema", () => {
		const validResult = deleteStorageObjectQuerySchema.safeParse({
			key: "restaurants/123/documents/license.pdf",
		});
		expect(validResult.success).toBe(true);

		const invalidResult = deleteStorageObjectQuerySchema.safeParse({});
		expect(invalidResult.success).toBe(false);
	});
});
