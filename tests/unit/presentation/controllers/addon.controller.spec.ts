import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { ICreateAddonUseCase } from "@/application/ports/use-cases/create-addon.use-case.port.ts";
import type { IListRestaurantAddonsUseCase } from "@/application/ports/use-cases/list-restaurant-addons.use-case.port.ts";
import type { IUpdateAddonUseCase } from "@/application/ports/use-cases/update-addon.use-case.port.ts";
import { AddonController } from "@/presentation/http/controllers/addon.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("AddonController", () => {
	let createAddonUseCase: jest.Mocked<ICreateAddonUseCase>;
	let listRestaurantAddonsUseCase: jest.Mocked<IListRestaurantAddonsUseCase>;
	let updateAddonUseCase: jest.Mocked<IUpdateAddonUseCase>;
	let controller: AddonController;
	let req: Partial<Request>;
	let res: Partial<Response>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const addonId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

	beforeEach(() => {
		createAddonUseCase = {
			execute: jest.fn(),
		};
		listRestaurantAddonsUseCase = {
			execute: jest.fn(),
		};
		updateAddonUseCase = {
			execute: jest.fn(),
		};

		controller = new AddonController(
			createAddonUseCase,
			listRestaurantAddonsUseCase,
			updateAddonUseCase,
		);

		res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};
	});

	describe("createAddon", () => {
		it("should return 201 with created addon data on success", async () => {
			req = {
				params: { restaurantId },
				body: {
					name: "Extra Cheese",
					description: "Creamy cheese",
					price: 50.0,
					imageKey: "addons/cheese.png",
					isAvailable: true,
				},
			};

			const mockResult = {
				id: "addon-123",
				restaurantId,
				name: "Extra Cheese",
				description: "Creamy cheese",
				price: 50.0,
				imageKey: "addons/cheese.png",
				isAvailable: true,
				createdAt: "2026-09-24T10:00:00.000Z",
				updatedAt: "2026-09-24T10:00:00.000Z",
			};
			createAddonUseCase.execute.mockResolvedValue(mockResult);

			await controller.createAddon(req as Request, res as Response);

			expect(createAddonUseCase.execute).toHaveBeenCalledWith({
				restaurantId,
				name: "Extra Cheese",
				description: "Creamy cheese",
				price: 50.0,
				imageKey: "addons/cheese.png",
				isAvailable: true,
			});
			expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					statusCode: HTTP_STATUS.CREATED,
					message: messages.ADDON_CREATED_SUCCESS,
					data: mockResult,
				}),
			);
		});

		it("should propagate error when use case throws", async () => {
			req = {
				params: { restaurantId },
				body: { name: "Extra Cheese", price: 50.0 },
			};
			const error = new Error("Database failure");
			createAddonUseCase.execute.mockRejectedValue(error);

			await expect(
				controller.createAddon(req as Request, res as Response),
			).rejects.toThrow("Database failure");
		});
	});

	describe("listAddons", () => {
		it("should return 200 with list of addons on success", async () => {
			req = {
				params: { restaurantId },
			};

			const mockResults = [
				{
					id: "addon-123",
					restaurantId,
					name: "Extra Cheese",
					description: "Creamy cheese",
					price: 50.0,
					imageKey: "addons/cheese.png",
					isAvailable: true,
					createdAt: "2026-09-24T10:00:00.000Z",
					updatedAt: "2026-09-24T10:00:00.000Z",
				},
			];
			listRestaurantAddonsUseCase.execute.mockResolvedValue(mockResults);

			await controller.listAddons(req as Request, res as Response);

			expect(listRestaurantAddonsUseCase.execute).toHaveBeenCalledWith(
				restaurantId,
			);
			expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					statusCode: HTTP_STATUS.OK,
					message: messages.ADDONS_FETCHED_SUCCESS,
					data: mockResults,
				}),
			);
		});

		it("should propagate error when usecase throws", async () => {
			req = {
				params: { restaurantId },
			};
			const error = new Error("Not found");
			listRestaurantAddonsUseCase.execute.mockRejectedValue(error);

			await expect(
				controller.listAddons(req as Request, res as Response),
			).rejects.toThrow("Not found");
		});
	});

	describe("updateAddon", () => {
		it("should return 200 with updated addon data on success", async () => {
			req = {
				params: { restaurantId, addonId },
				body: {
					name: "Updated Cheese",
					price: 70.0,
					description: "Double portion",
					imageKey: "addons/cheese-v2.png",
					isAvailable: false,
				},
			};

			const mockResult = {
				id: addonId,
				restaurantId,
				name: "Updated Cheese",
				description: "Double portion",
				price: 70.0,
				imageKey: "addons/cheese-v2.png",
				isAvailable: false,
				createdAt: "2026-09-24T10:00:00.000Z",
				updatedAt: "2026-09-25T12:00:00.000Z",
			};
			updateAddonUseCase.execute.mockResolvedValue(mockResult);

			await controller.updateAddon(req as Request, res as Response);

			expect(updateAddonUseCase.execute).toHaveBeenCalledWith({
				restaurantId,
				addonId,
				name: "Updated Cheese",
				description: "Double portion",
				price: 70.0,
				imageKey: "addons/cheese-v2.png",
				isAvailable: false,
			});
			expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					statusCode: HTTP_STATUS.OK,
					message: messages.ADDON_UPDATED_SUCCESS,
					data: mockResult,
				}),
			);
		});

		it("should propagate error when update use case throws", async () => {
			req = {
				params: { restaurantId, addonId },
				body: { name: "Updated Cheese" },
			};
			const error = new Error("Add-on not found");
			updateAddonUseCase.execute.mockRejectedValue(error);

			await expect(
				controller.updateAddon(req as Request, res as Response),
			).rejects.toThrow("Add-on not found");
		});
	});
});
