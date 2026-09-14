import { describe, expect, it } from "@jest/globals";
import { InvalidStorageKeyError } from "@/domain/errors/storage.errors";
import { StorageKeyVO } from "@/domain/value-objects/storage-key.vo";

describe("StorageKeyVO", () => {
	it("creates a valid StorageKeyVO instance", () => {
		const keyVO = StorageKeyVO.create("restaurants/123/documents/fssai.pdf");
		expect(keyVO.value).toBe("restaurants/123/documents/fssai.pdf");
		expect(keyVO.toString()).toBe("restaurants/123/documents/fssai.pdf");
	});

	it("strips leading slash from key", () => {
		const keyVO = StorageKeyVO.create("/restaurants/123/images/cover.jpg");
		expect(keyVO.value).toBe("restaurants/123/images/cover.jpg");
	});

	it("throws InvalidStorageKeyError for empty or whitespace key", () => {
		expect(() => StorageKeyVO.create("")).toThrow(InvalidStorageKeyError);
		expect(() => StorageKeyVO.create("   ")).toThrow(InvalidStorageKeyError);
	});

	it("throws InvalidStorageKeyError for key containing path traversal", () => {
		expect(() => StorageKeyVO.create("../secret/file.pdf")).toThrow(
			InvalidStorageKeyError,
		);
		expect(() =>
			StorageKeyVO.create("restaurants/123/../../../etc/passwd"),
		).toThrow(InvalidStorageKeyError);
	});

	it("correctly compares equality between two StorageKeyVO instances", () => {
		const key1 = StorageKeyVO.create("restaurants/123/doc.pdf");
		const key2 = StorageKeyVO.create("/restaurants/123/doc.pdf");
		const key3 = StorageKeyVO.create("restaurants/456/doc.pdf");

		expect(key1.equals(key2)).toBe(true);
		expect(key1.equals(key3)).toBe(false);
	});
});
