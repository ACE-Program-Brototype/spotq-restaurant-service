import { describe, expect, it, jest } from "@jest/globals";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { StorageOperationFailedError } from "@/domain/errors/storage.errors";
import { S3StorageService } from "@/infrastructure/services/s3-storage.service";
import { s3Client } from "@/infrastructure/storage/s3.client";
import { S3_ERROR_CODES } from "@/shared/constants/storage.constants";

describe("S3StorageService", () => {
	it("sends DeleteObjectCommand with bucket and key", async () => {
		const sendSpy = jest
			.spyOn(s3Client, "send")
			.mockImplementation(async () => ({} as never));

		const service = new S3StorageService();
		await service.deleteObject("restaurants/123/documents/file.pdf");

		expect(sendSpy).toHaveBeenCalledTimes(1);
		const command = sendSpy.mock.calls[0][0];
		expect(command).toBeInstanceOf(DeleteObjectCommand);
		expect(command.input).toMatchObject({
			Key: "restaurants/123/documents/file.pdf",
		});

		sendSpy.mockRestore();
	});

	it("handles NoSuchKey error gracefully without throwing", async () => {
		const notFoundError = new Error("The specified key does not exist.");
		notFoundError.name = S3_ERROR_CODES.NO_SUCH_KEY;

		const sendSpy = jest
			.spyOn(s3Client, "send")
			.mockImplementationOnce(async () => {
				throw notFoundError;
			});

		const service = new S3StorageService();
		await expect(
			service.deleteObject("restaurants/123/documents/missing.pdf"),
		).resolves.toBeUndefined();

		sendSpy.mockRestore();
	});

	it("maps general S3 error to StorageOperationFailedError", async () => {
		const s3Error = new Error("AWS S3 internal error");
		s3Error.name = "InternalError";

		const sendSpy = jest
			.spyOn(s3Client, "send")
			.mockImplementationOnce(async () => {
				throw s3Error;
			});

		const service = new S3StorageService();
		await expect(
			service.deleteObject("restaurants/123/documents/file.pdf"),
		).rejects.toThrow(StorageOperationFailedError);

		sendSpy.mockRestore();
	});
});
