import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { PaginatedMenuItemsResponseDto } from "@/application/dtos/menu-item/list-menu-items.dto.ts";
import type { IListMenuItemsUseCase } from "@/application/ports/use-cases/list-menu-items.use-case.port.ts";
import { MenuItemController } from "@/presentation/http/controllers/menu-item.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("MenuItemController", () => {
	let controller: MenuItemController;
	let mockListUseCase: jest.Mocked<IListMenuItemsUseCase>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

	beforeEach(() => {
		jest.clearAllMocks();

		mockListUseCase = {
			execute: jest.fn(),
		};

		controller = new MenuItemController(mockListUseCase);
	});

	describe("listMenuItems", () => {
		it("should list menu items and return 200 OK with formatted response", async () => {
			const expectedResponse: PaginatedMenuItemsResponseDto = {
				stats: {
					totalCategories: 3,
					totalMenuItems: 8,
					availableItems: 6,
					outOfStockItems: 2,
				},
				items: [
					{
						id: "item-1",
						restaurantId,
						categoryId: "cat-1",
						categoryName: "Main Course",
						name: "Wagyu Burger",
						price: 22.0,
						isVegetarian: false,
						isFeatured: true,
						isAvailable: true,
						image: "menu/burger.jpg",
						createdAt: "2026-09-28T10:00:00.000Z",
						updatedAt: "2026-09-28T10:00:00.000Z",
					},
				],
				pagination: {
					page: 1,
					limit: 10,
					total: 8,
					totalPages: 1,
					hasNextPage: false,
					hasPrevPage: false,
				},
			};

			mockListUseCase.execute.mockResolvedValueOnce(expectedResponse);

			const req = {
				params: {
					restaurantId,
				},
				user: {
					restaurantId,
					userId: restaurantId,
					email: "owner@spotq.com",
					role: "restaurant_owner",
				},
				query: {
					page: 1,
					limit: 10,
					search: "Wagyu",
					sortBy: "price",
					sortOrder: "asc",
				},
			} as unknown as Request;

			const jsonMock = jest.fn();
			const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
			const res = {
				status: statusMock,
				json: jsonMock,
			} as unknown as Response;

			await controller.listMenuItems(req, res);

			expect(mockListUseCase.execute).toHaveBeenCalledWith({
				restaurantId,
				page: 1,
				limit: 10,
				search: "Wagyu",
				categoryId: undefined,
				status: undefined,
				minPrice: undefined,
				maxPrice: undefined,
				isVegetarian: undefined,
				isFeatured: undefined,
				sortBy: "price",
				sortOrder: "asc",
			});
			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.MENU_ITEMS_FETCHED_SUCCESS,
					statusCode: HTTP_STATUS.OK,
					data: expectedResponse,
				}),
			);
		});

		it("should read validated query from res.locals.query when present", async () => {
			mockListUseCase.execute.mockResolvedValueOnce({
				stats: {
					totalCategories: 1,
					totalMenuItems: 0,
					availableItems: 0,
					outOfStockItems: 0,
				},
				items: [],
				pagination: {
					page: 2,
					limit: 20,
					total: 0,
					totalPages: 0,
					hasNextPage: false,
					hasPrevPage: true,
				},
			});

			const req = {
				params: { restaurantId },
				query: { sort_by: "price", is_vegetarian: "true" },
			} as unknown as Request;

			const jsonMock = jest.fn();
			const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
			const res = {
				status: statusMock,
				json: jsonMock,
				locals: {
					query: {
						page: 2,
						limit: 20,
						sortBy: "price",
						sortOrder: "asc",
						isVegetarian: true,
					},
				},
			} as unknown as Response;

			await controller.listMenuItems(req, res);

			expect(mockListUseCase.execute).toHaveBeenCalledWith({
				restaurantId,
				page: 2,
				limit: 20,
				search: undefined,
				categoryId: undefined,
				status: undefined,
				minPrice: undefined,
				maxPrice: undefined,
				isVegetarian: true,
				isFeatured: undefined,
				sortBy: "price",
				sortOrder: "asc",
			});
			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		});
	});
});
