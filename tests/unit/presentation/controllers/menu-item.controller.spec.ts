import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { ICreateMenuItemUseCase } from "@/application/ports/use-cases/create-menu-item.use-case.port.ts";
import { MenuItemController } from "@/presentation/http/controllers/menu-item.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("MenuItemController", () => {
	let createMenuItemUseCase: jest.Mocked<ICreateMenuItemUseCase>;
	let controller: MenuItemController;
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: jest.Mock;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const categoryId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

	beforeEach(() => {
		createMenuItemUseCase = {
			execute: jest.fn(),
		};

		controller = new MenuItemController(createMenuItemUseCase);

		res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};
		next = jest.fn();
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
					addons: [
						{ addonId: "addon-1", priceOverride: 40.0 },
					],
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

			await controller.createMenuItem(
				req as Request,
				res as Response,
				next as never,
			);

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

		it("should pass error to next when use case throws", async () => {
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

			await controller.createMenuItem(
				req as Request,
				res as Response,
				next as never,
			);

			expect(next).toHaveBeenCalledWith(expectedError);
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

			await controller.createMenuItem(
				req as Request,
				res as Response,
				next as never,
			);

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
	});
});
