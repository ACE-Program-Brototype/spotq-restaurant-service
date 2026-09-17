import { describe, expect, it } from "@jest/globals";
import { FilePolicyValidatorService } from "@/infrastructure/services/file-policy-validator.service";
import { FileCategory } from "@/shared/storage/file-category.enum";
import { UnsupportedFileTypeError } from "@/application/errors/unsupported-file-type.error";

describe("FilePolicyValidatorService", () => {
	const service = new FilePolicyValidatorService();

	it("should allow image/avif for PROFILE category", () => {
		expect(() =>
			service.validate({
				fileCategory: FileCategory.PROFILE,
				contentType: "image/avif",
				fileSize: 1024 * 1024,
			}),
		).not.toThrow();
	});

	it("should allow image/avif for IMAGES, DOCUMENTS, RECEIPTS, and MENUS categories", () => {
		for (const fileCategory of [
			FileCategory.IMAGES,
			FileCategory.DOCUMENTS,
			FileCategory.RECEIPTS,
			FileCategory.MENUS,
		]) {
			expect(() =>
				service.validate({
					fileCategory,
					contentType: "image/avif",
					fileSize: 1024 * 1024,
				}),
			).not.toThrow();
		}
	});

	it("should throw UnsupportedFileTypeError for unsupported content types", () => {
		expect(() =>
			service.validate({
				fileCategory: FileCategory.PROFILE,
				contentType: "video/mp4",
				fileSize: 1024 * 1024,
			}),
		).toThrow(UnsupportedFileTypeError);
	});
});
