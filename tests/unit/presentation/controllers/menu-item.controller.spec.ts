import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { PaginatedMenuItemsResponseDto } from "@/application/dtos/menu-item/list-menu-items.dto.ts";
import type { ICreateMenuItemUseCase } from "@/application/ports/use-cases/create-menu-item.use-case.port.ts";
import type { IDeleteMenuItemUseCase } from "@/application/ports/use-cases/delete-menu-item.use-case.port.ts";
import type { IGetCustomerMenuItemDetailsUseCase } from "@/application/ports/use-cases/get-customer-menu-item-details.use-case.port.ts";
import type { IGetRestaurantOwnerMenuItemDetailsUseCase } from "@/application/ports/use-cases/get-restaurant-owner-menu-item-details.use-case.port.ts";
import type { IListMenuItemsUseCase } from "@/application/ports/use-cases/list-menu-items.use-case.port.ts";
import type { IListStaffMenuItemsUseCase } from "@/application/ports/use-cases/list-staff-menu-items.use-case.port.ts";
import type { IUpdateMenuItemStatusUseCase } from "@/application/ports/use-cases/update-menu-item-status.use-case.port.ts";
import type { IUpdateMenuItemUseCase } from "@/application/ports/use-cases/update-menu-item.use-case.port.ts";
import { MenuItemController } from "@/presentation/http/controllers/menu-item.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("MenuItemController", () => {
	let createMenuItemUseCase: jest.Mocked<ICreateMenuItemUseCase>;
	let listMenuItemsUseCase: jest.Mocked<IListMenuItemsUseCase>;
	let listStaffMenuItemsUseCase: jest.Mocked<IListStaffMenuItemsUseCase>;
	let getRestaurantOwnerMenuItemDetailsUseCase: jest.Mocked<IGetRestaurantOwnerMenuItemDetailsUseCase>;
	let getCustomerMenuItemDetailsUseCase: jest.Mocked<IGetCustomerMenuItemDetailsUseCase>;
	let deleteMenuItemUseCase: jest.Mocked<IDeleteMenuItemUseCase>;
	let updateMenuItemStatusUseCase: jest.Mocked<IUpdateMenuItemStatusUseCase>;
	let updateMenuItemUseCase: jest.Mocked<IUpdateMenuItemUseCase>;
	let controller: MenuItemController;
	let req: Partial<Request>;
	let res: Partial<Response>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const categoryId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

	beforeEach(() => {
		createMenuItemUseCase = {
			execute: jest.fn(),
		};

		listMenuItemsUseCase = {
			execute: jest.fn(),
		};

		listStaffMenuItemsUseCase = {
			execute: jest.fn(),
		};

		getRestaurantOwnerMenuItemDetailsUseCase = {
			execute: jest.fn(),
		};

		getCustomerMenuItemDetailsUseCase = {
			execute: jest.fn(),
		};

		deleteMenuItemUseCase = {
			execute: jest.fn(),
		};

		updateMenuItemStatusUseCase = {
			execute: jest.fn(),
		};

		updateMenuItemUseCase = {
			execute: jest.fn(),
		};

		controller = new MenuItemController(
			createMenuItemUseCase,
			listMenuItemsUseCase,
			listStaffMenuItemsUseCase,
			getRestaurantOwnerMenuItemDetailsUseCase,
			getCustomerMenuItemDetailsUseCase,
			deleteMenuItemUseCase,
			updateMenuItemStatusUseCase,
			updateMenuItemUseCase,
		);

		res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};
	});

	describe("createMenuItem", () => {
		it("should return 201 with created menu item data on success", async () => {
			req = {
				params: { restaurantId },
				body: {
					categoryId,
					name: "Chicken Dum Biryani",
					description: "Delicious Dum Biryani",
					price: 320.0,
					preparationTime: 25,
					calories: 650,
					isVegetarian: false,
					isFeatured: true,
					isAvailable: true,
					images: [{ objectKey: "menu/biryani.png", displayOrder: 0 }],
					variants: [
						{
							sku: "BIRYANI-HALF",
							name: "Half Portion",
							price: 200.0,
							isDefault: false,
						},
						{
							sku: "BIRYANI-FULL",
							name: "Full Portion",
							price: 320.0,
							isDefault: true,
						},
					],
					addons: [{ addonId: "addon-1", priceOverride: 40.0 }],
				},
			};

			const mockResult = {
				id: "item-123",
				restaurantId,
				categoryId,
				name: "Chicken Dum Biryani",
				description: "Delicious Dum Biryani",
				price: 320.0,
				preparationTime: 25,
				calories: 650,
				isVegetarian: false,
				isFeatured: true,
				isAvailable: true,
				images: [
					{ id: "img-1", objectKey: "menu/biryani.png", displayOrder: 0 },
				],
				variants: [
					{
						id: "var-1",
						sku: "BIRYANI-HALF",
						name: "Half Portion",
						price: 200.0,
						isDefault: false,
					},
					{
						id: "var-2",
						sku: "BIRYANI-FULL",
						name: "Full Portion",
						price: 320.0,
						isDefault: true,
					},
				],
				addons: [
					{
						id: "junc-1",
						addonId: "addon-1",
						name: "Raita",
						price: 30.0,
						priceOverride: 40.0,
						displayOrder: 0,
					},
				],
				createdAt: "2026-09-24T10:00:00.000Z",
				updatedAt: "2026-09-24T10:00:00.000Z",
			};

			createMenuItemUseCase.execute.mockResolvedValue(mockResult);

			await controller.createMenuItem(req as Request, res as Response);

			expect(createMenuItemUseCase.execute).toHaveBeenCalledWith(
				expect.objectContaining({
					restaurantId,
					categoryId,
					name: "Chicken Dum Biryani",
					price: 320.0,
				}),
			);
			expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					statusCode: HTTP_STATUS.CREATED,
					message: messages.MENU_ITEM_CREATED_SUCCESS,
					data: mockResult,
				}),
			);
		});

		it("should propagate error when use case throws", async () => {
			req = {
				params: { restaurantId },
				body: {
					categoryId,
					name: "Chicken Dum Biryani",
					price: 320.0,
				},
			};

			const expectedError = new Error("Failed to create menu item");
			createMenuItemUseCase.execute.mockRejectedValue(expectedError);

			await expect(
				controller.createMenuItem(req as Request, res as Response),
			).rejects.toThrow("Failed to create menu item");
		});

		it("should leave displayOrder undefined for images when omitted", async () => {
			req = {
				params: { restaurantId },
				body: {
					categoryId,
					name: "Chicken Dum Biryani",
					price: 320.0,
					images: [{ objectKey: "menu/biryani.png" }],
					addons: [{ addonId: "addon-1" }],
				},
			};

			createMenuItemUseCase.execute.mockResolvedValue({} as never);

			await controller.createMenuItem(req as Request, res as Response);

			expect(createMenuItemUseCase.execute).toHaveBeenCalledWith(
				expect.objectContaining({
					images: [{ objectKey: "menu/biryani.png", displayOrder: undefined }],
					addons: [
						expect.objectContaining({
							addonId: "addon-1",
						}),
					],
				}),
			);
		});

		it("should default isAvailable to true when omitted from body", async () => {
			req = {
				params: { restaurantId },
				body: {
					categoryId,
					name: "Chicken Dum Biryani",
					description: "Delicious Dum Biryani",
					price: 320.0,
					preparationTime: 25,
					isVegetarian: false,
					images: [{ objectKey: "menu/biryani.png" }],
				},
			};

			createMenuItemUseCase.execute.mockResolvedValue({} as never);

			await controller.createMenuItem(req as Request, res as Response);

			expect(createMenuItemUseCase.execute).toHaveBeenCalledWith(
				expect.objectContaining({
					isAvailable: true,
					description: "Delicious Dum Biryani",
					preparationTime: 25,
					isVegetarian: false,
				}),
			);
		});

		it("should honor isAvailable when set to false", async () => {
			req = {
				params: { restaurantId },
				body: {
					categoryId,
					name: "Chicken Dum Biryani",
					description: "Delicious Dum Biryani",
					price: 320.0,
					preparationTime: 25,
					isVegetarian: false,
					isAvailable: false,
					images: [{ objectKey: "menu/biryani.png" }],
				},
			};

			createMenuItemUseCase.execute.mockResolvedValue({} as never);

			await controller.createMenuItem(req as Request, res as Response);

			expect(createMenuItemUseCase.execute).toHaveBeenCalledWith(
				expect.objectContaining({
					isAvailable: false,
				}),
			);
		});
	});

	describe("listMenuItems", () => {
		it("should successfully list menu items and return 200", async () => {
			const expectedResponse: PaginatedMenuItemsResponseDto = {
				stats: {
					totalCategories: 2,
					totalMenuItems: 5,
					availableItems: 4,
					outOfStockItems: 1,
				},
				items: [],
				pagination: {
					page: 1,
					limit: 10,
					total: 0,
					totalPages: 0,
					hasNextPage: false,
					hasPrevPage: false,
				},
			};

			listMenuItemsUseCase.execute.mockResolvedValueOnce(expectedResponse);

			const listReq = {
				params: { restaurantId },
				query: {
					page: "1",
					limit: "10",
					search: "burger",
					category_id: categoryId,
					status: "available",
					min_price: "10",
					max_price: "50",
					is_vegetarian: "true",
					is_featured: "false",
					sort_by: "price",
					sort_order: "asc",
				},
			} as unknown as Request;

			const jsonMock = jest.fn();
			const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
			const listRes = {
				status: statusMock,
				json: jsonMock,
				locals: {},
			} as unknown as Response;

			await controller.listMenuItems(listReq, listRes);

			expect(listMenuItemsUseCase.execute).toHaveBeenCalledWith({
				restaurantId,
				page: 1,
				limit: 10,
				search: "burger",
				categoryId,
				status: "available",
				minPrice: 10,
				maxPrice: 50,
				isVegetarian: true,
				isFeatured: false,
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
			listMenuItemsUseCase.execute.mockResolvedValueOnce({
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

			const listReq = {
				params: { restaurantId },
				query: { sort_by: "price", is_vegetarian: "true" },
			} as unknown as Request;

			const jsonMock = jest.fn();
			const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
			const listRes = {
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

			await controller.listMenuItems(listReq, listRes);

			expect(listMenuItemsUseCase.execute).toHaveBeenCalledWith({
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

	describe("getMenuItemDetails", () => {
		it("should return 200 with menu item details data on success", async () => {
			const menuItemId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
			const mockDetailsDto = {
				id: menuItemId,
				restaurantId,
				categoryId,
				categoryName: "Burgers",
				category: {
					id: categoryId,
					name: "Burgers",
					description: null,
				},
				name: "Classic Cheeseburger",
				description: "With cheddar and pickles",
				price: 12.99,
				preparationTime: 15,
				calories: 500,
				isVegetarian: false,
				isFeatured: false,
				isAvailable: true,
				images: [],
				variants: [],
				addons: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			getRestaurantOwnerMenuItemDetailsUseCase.execute.mockResolvedValueOnce(
				mockDetailsDto as never,
			);

			const detailReq = {
				params: { restaurantId, menuItemId },
			} as unknown as Request;

			const jsonMock = jest.fn();
			const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
			const detailRes = {
				status: statusMock,
				json: jsonMock,
			} as unknown as Response;

			await controller.getMenuItemDetails(detailReq, detailRes);

			expect(
				getRestaurantOwnerMenuItemDetailsUseCase.execute,
			).toHaveBeenCalledWith({
				restaurantId,
				menuItemId,
			});
			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.MENU_ITEM_DETAILS_FETCHED_SUCCESS,
					data: mockDetailsDto,
				}),
			);
		});

		it("should return 200 for customer getCustomerMenuItemDetails", async () => {
			const menuItemId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
			const mockDetailsDto = {
				id: menuItemId,
				name: "Classic Cheeseburger",
				price: 14.5,
			};

			getCustomerMenuItemDetailsUseCase.execute.mockResolvedValueOnce(
				mockDetailsDto as never,
			);

			const detailReq = {
				params: { restaurantId, menuItemId },
			} as unknown as Request;

			const jsonMock = jest.fn();
			const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
			const detailRes = {
				status: statusMock,
				json: jsonMock,
			} as unknown as Response;

			await controller.getCustomerMenuItemDetails(detailReq, detailRes);

			expect(getCustomerMenuItemDetailsUseCase.execute).toHaveBeenCalledWith({
				restaurantId,
				menuItemId,
			});
			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.MENU_ITEM_DETAILS_FETCHED_SUCCESS,
					data: mockDetailsDto,
				}),
			);
		});
	});

	describe("listStaffMenuItems", () => {
		it("should return 200 with staff menu items listing data on success", async () => {
			const mockStaffResponse = {
				restaurantId,
				page: 1,
				limit: 50,
				totalCount: 1,
				totalPages: 1,
				items: [
					{
						id: "item-001",
						name: "Pepperoni Pizza",
						sku: "PIZ-PEP",
						description: "Classic pepperoni",
						basePrice: 12.5,
						categoryId,
						categoryName: "Pizzas",
						displayOrder: 1,
						isActive: true,
						isAvailable: true,
						unavailabilityReason: null,
						autoResetAt: null,
						variantCount: 1,
						hasVariants: true,
						variants: [
							{
								id: "var-1",
								name: "Small",
								sku: "PIZ-PEP-SM",
								price: 12.5,
								isDefault: true,
								isAvailable: true,
							},
						],
						updatedAt: new Date().toISOString(),
					},
				],
			};

			listStaffMenuItemsUseCase.execute.mockResolvedValueOnce(
				mockStaffResponse,
			);

			const req = {
				params: { restaurantId },
				query: {},
				user: {
					userId: "staff-1",
					restaurantId,
					role: "staff",
					email: "staff@example.com",
				},
			} as unknown as Request;

			const jsonMock = jest.fn();
			const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
			const res = {
				status: statusMock,
				json: jsonMock,
				locals: {
					query: {
						page: 1,
						limit: 50,
						search: "Pepperoni",
						categoryId,
						isAvailable: true,
						includeInactive: false,
						includeVariants: true,
						sortBy: "categoryDisplayOrder",
						sortOrder: "asc",
					},
				},
			} as unknown as Response;

			await controller.listStaffMenuItems(req, res);

			expect(listStaffMenuItemsUseCase.execute).toHaveBeenCalledWith({
				restaurantId,
				page: 1,
				limit: 50,
				search: "Pepperoni",
				categoryId,
				isAvailable: true,
				includeInactive: false,
				includeVariants: true,
				sortBy: "categoryDisplayOrder",
				sortOrder: "asc",
				userRole: "staff",
			});
			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.STAFF_MENU_ITEMS_FETCHED_SUCCESS,
					data: mockStaffResponse,
				}),
			);
		});
	});

	describe("deleteMenuItem", () => {
		it("should return 200 on successful deletion", async () => {
			const menuItemId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
			deleteMenuItemUseCase.execute.mockResolvedValueOnce(undefined);

			const deleteReq = {
				params: { restaurantId, menuItemId },
			} as unknown as Request;

			const jsonMock = jest.fn();
			const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
			const deleteRes = {
				status: statusMock,
				json: jsonMock,
			} as unknown as Response;

			await controller.deleteMenuItem(deleteReq, deleteRes);

			expect(deleteMenuItemUseCase.execute).toHaveBeenCalledWith({
				restaurantId,
				menuItemId,
			});
			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.MENU_ITEM_DELETED_SUCCESS,
					data: null,
				}),
			);
		});
	});

	describe("updateMenuItemStatus", () => {
		it("should return 200 on successful status update with isAvailable camelCase", async () => {
			const menuItemId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
			const mockUpdatedItem = {
				id: menuItemId,
				restaurantId,
				categoryId,
				categoryName: "Burgers",
				category: null,
				name: "Classic Cheeseburger",
				description: null,
				price: 12.99,
				preparationTime: 15,
				calories: 500,
				isVegetarian: false,
				isFeatured: false,
				isAvailable: false,
				images: [],
				variants: [
					{
						id: "var-1",
						sku: "BURGER-1",
						name: "Regular",
						price: 12.99,
						isDefault: true,
						isAvailable: false,
					},
				],
				addons: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			updateMenuItemStatusUseCase.execute.mockResolvedValueOnce(
				mockUpdatedItem as never,
			);

			const patchReq = {
				params: { restaurantId, menuItemId },
				body: { isAvailable: false },
			} as unknown as Request;

			const jsonMock = jest.fn();
			const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
			const patchRes = {
				status: statusMock,
				json: jsonMock,
			} as unknown as Response;

			await controller.updateMenuItemStatus(patchReq, patchRes);

			expect(updateMenuItemStatusUseCase.execute).toHaveBeenCalledWith({
				restaurantId,
				menuItemId,
				isAvailable: false,
			});
			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.MENU_ITEM_STATUS_UPDATED_SUCCESS,
					data: mockUpdatedItem,
				}),
			);
		});

		it("should support is_available snake_case in body", async () => {
			const menuItemId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
			updateMenuItemStatusUseCase.execute.mockResolvedValueOnce({} as never);

			const patchReq = {
				params: { restaurantId, menuItemId },
				body: { is_available: true },
			} as unknown as Request;

			const jsonMock = jest.fn();
			const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
			const patchRes = {
				status: statusMock,
				json: jsonMock,
			} as unknown as Response;

			await controller.updateMenuItemStatus(patchReq, patchRes);

			expect(updateMenuItemStatusUseCase.execute).toHaveBeenCalledWith({
				restaurantId,
				menuItemId,
				isAvailable: true,
			});
			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		});
	});

	describe("updateMenuItem", () => {
		it("should return 200 on successful menu item update", async () => {
			const menuItemId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
			const mockUpdatedItem = {
				id: menuItemId,
				restaurantId,
				categoryId,
				name: "Updated Deluxe Burger",
				description: "With double cheese",
				price: 18.99,
				preparationTime: 20,
				calories: 600,
				isVegetarian: false,
				isFeatured: true,
				isAvailable: true,
				images: [{ id: "img-1", objectKey: "menu/deluxe.png", displayOrder: 0 }],
				variants: [
					{
						id: "var-1",
						sku: "BURGER-DLX",
						name: "Large",
						price: 18.99,
						isDefault: true,
						isAvailable: true,
					},
				],
				addons: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			updateMenuItemUseCase.execute.mockResolvedValueOnce(
				mockUpdatedItem as never,
			);

			const updateReq = {
				params: { restaurantId, menuItemId },
				body: {
					name: "Updated Deluxe Burger",
					description: "With double cheese",
					price: 18.99,
					preparationTime: 20,
					calories: 600,
					isVegetarian: false,
					isFeatured: true,
					isAvailable: true,
					images: [{ objectKey: "menu/deluxe.png" }],
					variants: [
						{
							id: "var-1",
							sku: "BURGER-DLX",
							name: "Large",
							price: 18.99,
							isDefault: true,
						},
					],
				},
			} as unknown as Request;

			const jsonMock = jest.fn();
			const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
			const updateRes = {
				status: statusMock,
				json: jsonMock,
			} as unknown as Response;

			await controller.updateMenuItem(updateReq, updateRes);

			expect(updateMenuItemUseCase.execute).toHaveBeenCalledWith(
				expect.objectContaining({
					restaurantId,
					menuItemId,
					name: "Updated Deluxe Burger",
					price: 18.99,
				}),
			);
			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.MENU_ITEM_UPDATED_SUCCESS,
					data: mockUpdatedItem,
				}),
			);
		});
	});
});
