import { describe, expect, it } from "@jest/globals";
import { getPresignedUrlQuerySchema } from "@/presentation/http/validators/get-presigned-url.validator";

describe("getPresignedUrlQuerySchema", () => {
	it("validates when valid key is provided", () => {
		const result = getPresignedUrlQuerySchema.safeParse({
			key: "restaurants/123/documents/license.pdf",
		});

		expect(result.success).toBe(true);
	});

	it("fails when no key is provided", () => {
		const result = getPresignedUrlQuerySchema.safeParse({});

		expect(result.success).toBe(false);
	});

	it("fails when key contains path traversal characters", () => {
		const result = getPresignedUrlQuerySchema.safeParse({
			key: "../private/secret.key",
		});

		expect(result.success).toBe(false);
	});
});
