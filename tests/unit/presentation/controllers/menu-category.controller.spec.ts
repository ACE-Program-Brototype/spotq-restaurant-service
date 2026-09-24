import type { Request, Response } from "express";
import type { MenuCategoryResponseDto } from "@/application/dtos/menu/create-menu-category.dto.ts";
import type { ICreateMenuCategoryUseCase } from "@/application/ports/use-cases/create-menu-category.use-case.port.ts";
import type { IUpdateMenuCategoryUseCase } from "@/application/ports/use-cases/update-menu-category.use-case.port.ts";
import { MenuCategoryController } from "@/presentation/http/controllers/menu-category.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("MenuCategoryController", () => {
	let controller: MenuCategoryController;
	let mockCreateUseCase: jest.Mocked<ICreateMenuCategoryUseCase>;
	let mockUpdateUseCase: jest.Mocked<IUpdateMenuCategoryUseCase>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const categoryId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

	beforeEach(() => {
		jest.clearAllMocks();

		mockCreateUseCase = {
			execute: jest.fn(),
		};

		mockUpdateUseCase = {
			execute: jest.fn(),
		};

		controller = new MenuCategoryController(
			mockCreateUseCase,
			mockUpdateUseCase,
		);
	});

	describe("createCategory", () => {
		it("should create category and return 201 Created with success payload", async () => {
			const expectedResponse: MenuCategoryResponseDto = {
				id: "cat-123",
				restaurantId,
				name: "Main Course",
				description: "Main dishes",
				displayOrder: 1,
				isActive: true,
				createdAt: "2026-09-23T10:00:00.000Z",
				updatedAt: "2026-09-23T10:00:00.000Z",
			};

			mockCreateUseCase.execute.mockResolvedValueOnce(expectedResponse);

			const req = {
				params: { restaurantId },
				body: {
					name: "Main Course",
					description: "Main dishes",
					displayOrder: 1,
				},
			} as unknown as Request;

			const jsonMock = jest.fn();
			const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
			const res = {
				status: statusMock,
				json: jsonMock,
			} as unknown as Response;

			const nextMock = jest.fn();

			await controller.createCategory(req, res, nextMock);

			expect(mockCreateUseCase.execute).toHaveBeenCalledWith({
				restaurantId,
				name: "Main Course",
				description: "Main dishes",
				displayOrder: 1,
			});
			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.MENU_CATEGORY_CREATED_SUCCESS,
					statusCode: HTTP_STATUS.CREATED,
					data: expectedResponse,
				}),
			);
			expect(nextMock).not.toHaveBeenCalled();
		});

		it("should call next with error when use case throws an exception", async () => {
			const testError = new Error("Database failure");
			mockCreateUseCase.execute.mockRejectedValueOnce(testError);

			const req = {
				params: { restaurantId },
				body: { name: "Starters" },
			} as unknown as Request;

			const res = {} as Response;
			const nextMock = jest.fn();

			await controller.createCategory(req, res, nextMock);

			expect(nextMock).toHaveBeenCalledWith(testError);
		});
	});

	describe("updateCategory", () => {
		it("should update category and return 200 OK with success payload", async () => {
			const expectedResponse: MenuCategoryResponseDto = {
				id: categoryId,
				restaurantId,
				name: "Main Course Updated",
				description: "Main dishes updated",
				displayOrder: 2,
				isActive: false,
				createdAt: "2026-09-23T10:00:00.000Z",
				updatedAt: "2026-09-24T10:00:00.000Z",
			};

			mockUpdateUseCase.execute.mockResolvedValueOnce(expectedResponse);

			const req = {
				params: { restaurantId, categoryId },
				body: {
					name: "Main Course Updated",
					description: "Main dishes updated",
					displayOrder: 2,
					isActive: false,
				},
			} as unknown as Request;

			const jsonMock = jest.fn();
			const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
			const res = {
				status: statusMock,
				json: jsonMock,
			} as unknown as Response;

			const nextMock = jest.fn();

			await controller.updateCategory(req, res, nextMock);

			expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
				restaurantId,
				categoryId,
				name: "Main Course Updated",
				description: "Main dishes updated",
				displayOrder: 2,
				isActive: false,
			});
			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.MENU_CATEGORY_UPDATED_SUCCESS,
					statusCode: HTTP_STATUS.OK,
					data: expectedResponse,
				}),
			);
			expect(nextMock).not.toHaveBeenCalled();
		});

		it("should call next with error when update use case throws an exception", async () => {
			const testError = new Error("Database failure");
			mockUpdateUseCase.execute.mockRejectedValueOnce(testError);

			const req = {
				params: { restaurantId, categoryId },
				body: { name: "Starters" },
			} as unknown as Request;

			const res = {} as Response;
			const nextMock = jest.fn();

			await controller.updateCategory(req, res, nextMock);

			expect(nextMock).toHaveBeenCalledWith(testError);
		});
	});
});
