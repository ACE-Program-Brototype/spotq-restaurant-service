import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { IDeleteStorageObjectUseCase } from "@/application/ports/use-cases/delete-storage-object.use-case.port";
import type { IGeneratePresignedUrlUseCase } from "@/application/ports/use-cases/generate-presigned-url.use-case.port";
import type { IGetPresignedUrlUseCase } from "@/application/ports/use-cases/get-presigned-url.use-case.port";
import { StorageController } from "@/presentation/http/controllers/storage.controller";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { messages } from "@/shared/constants/message.constants";

describe("StorageController", () => {
	let controller: StorageController;
	let mockGeneratePresignedUrlUseCase: jest.Mocked<IGeneratePresignedUrlUseCase>;
	let mockGetPresignedUrlUseCase: jest.Mocked<IGetPresignedUrlUseCase>;
	let mockDeleteStorageObjectUseCase: jest.Mocked<IDeleteStorageObjectUseCase>;
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;

	beforeEach(() => {
		mockGeneratePresignedUrlUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<IGeneratePresignedUrlUseCase>;

		mockGetPresignedUrlUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<IGetPresignedUrlUseCase>;

		mockDeleteStorageObjectUseCase = {
			execute: jest.fn<IDeleteStorageObjectUseCase["execute"]>().mockResolvedValue({
				success: true,
				message: messages.S3_OBJECT_DELETED_SUCCESS,
			}),
		} as unknown as jest.Mocked<IDeleteStorageObjectUseCase>;

		controller = new StorageController(
			mockGeneratePresignedUrlUseCase,
			mockGetPresignedUrlUseCase,
			mockDeleteStorageObjectUseCase,
		);

		mockReq = {
			body: {},
			query: {},
			user: {
				userId: "user-1",
				restaurantId: "res-1",
				email: "res@spotq.com",
				role: "RESTAURANT",
			},
		};

		mockRes = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};
	});

	describe("deleteStorageObject", () => {
		it("deletes object when key is passed in body", async () => {
			mockReq.body = { key: "restaurants/res-1/documents/doc.pdf" };

			await controller.deleteStorageObject(
				mockReq as Request,
				mockRes as Response,
			);

			expect(mockDeleteStorageObjectUseCase.execute).toHaveBeenCalledWith(
				{ key: "restaurants/res-1/documents/doc.pdf" },
				mockReq.user,
			);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.SUCCESS);
			expect(mockRes.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.S3_OBJECT_DELETED_SUCCESS,
					data: {
						success: true,
						message: messages.S3_OBJECT_DELETED_SUCCESS,
					},
				}),
			);
		});

		it("deletes object when objectKey is passed in body", async () => {
			mockReq.body = { objectKey: "restaurants/res-1/images/img.png" };

			await controller.deleteStorageObject(
				mockReq as Request,
				mockRes as Response,
			);

			expect(mockDeleteStorageObjectUseCase.execute).toHaveBeenCalledWith(
				{ key: "restaurants/res-1/images/img.png" },
				mockReq.user,
			);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.SUCCESS);
		});

		it("falls back to query parameter when body is empty", async () => {
			mockReq.body = {};
			mockReq.query = { key: "restaurants/res-1/menu/burger.jpg" };

			await controller.deleteStorageObject(
				mockReq as Request,
				mockRes as Response,
			);

			expect(mockDeleteStorageObjectUseCase.execute).toHaveBeenCalledWith(
				{ key: "restaurants/res-1/menu/burger.jpg" },
				mockReq.user,
			);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.SUCCESS);
		});
	});
});
