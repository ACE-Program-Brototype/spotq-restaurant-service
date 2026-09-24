import type { Request, Response } from "express";
import type { MenuCategoryResponseDto } from "@/application/dtos/menu/create-menu-category.dto.ts";
import type { ListMenuCategoriesResponseDto } from "@/application/dtos/menu/list-menu-categories.dto.ts";
import type { ICreateMenuCategoryUseCase } from "@/application/ports/use-cases/create-menu-category.use-case.port.ts";
import type { IListRestaurantMenuCategoriesUseCase } from "@/application/ports/use-cases/list-restaurant-menu-categories.use-case.port.ts";
import { MenuCategoryController } from "@/presentation/http/controllers/menu-category.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("MenuCategoryController", () => {
	let controller: MenuCategoryController;
	let mockCreateUseCase: jest.Mocked<ICreateMenuCategoryUseCase>;
	let mockListUseCase: jest.Mocked<IListRestaurantMenuCategoriesUseCase>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

	beforeEach(() => {
		jest.clearAllMocks();

		mockCreateUseCase = {
			execute: jest.fn(),
		};

		mockListUseCase = {
			execute: jest.fn(),
		};

		controller = new MenuCategoryController(
			mockCreateUseCase,
			mockListUseCase,
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

	describe("listRestaurantCategories", () => {
		it("should return 200 OK with categories payload", async () => {
			const expectedResponse: ListMenuCategoriesResponseDto = {
				restaurantId,
				categories: [
					{
						id: "cat-1",
						name: "Appetizers",
						description: "Starters",
						isActive: true,
						displayOrder: 1,
					},
					{
						id: "cat-2",
						name: "Desserts",
						description: null,
						isActive: true,
						displayOrder: 2,
					},
				],
			};

			mockListUseCase.execute.mockResolvedValueOnce(expectedResponse);

			const req = {
				params: { restaurantId },
			} as unknown as Request;

			const jsonMock = jest.fn();
			const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
			const res = {
				status: statusMock,
				json: jsonMock,
			} as unknown as Response;

			const nextMock = jest.fn();

			await controller.listRestaurantCategories(req, res, nextMock);

			expect(mockListUseCase.execute).toHaveBeenCalledWith({
				restaurantId,
			});
			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.MENU_CATEGORIES_FETCHED_SUCCESS,
					statusCode: HTTP_STATUS.OK,
					data: expectedResponse,
				}),
			);
			expect(nextMock).not.toHaveBeenCalled();
		});

		it("should call next with error when use case throws an error", async () => {
			const testError = new Error("Restaurant not found");
			mockListUseCase.execute.mockRejectedValueOnce(testError);

			const req = {
				params: { restaurantId },
			} as unknown as Request;

			const res = {} as Response;
			const nextMock = jest.fn();

			await controller.listRestaurantCategories(req, res, nextMock);

			expect(nextMock).toHaveBeenCalledWith(testError);
		});
	});
});
