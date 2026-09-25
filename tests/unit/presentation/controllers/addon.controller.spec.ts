import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { ICreateAddonUseCase } from "@/application/ports/use-cases/create-addon.use-case.port.ts";
import type { IListRestaurantAddonsUseCase } from "@/application/ports/use-cases/list-restaurant-addons.use-case.port.ts";
import { AddonController } from "@/presentation/http/controllers/addon.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("AddonController", () => {
	let createAddonUseCase: jest.Mocked<ICreateAddonUseCase>;
	let listRestaurantAddonsUseCase: jest.Mocked<IListRestaurantAddonsUseCase>;
	let controller: AddonController;
	let req: Partial<Request>;
	let res: Partial<Response>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

	beforeEach(() => {
		createAddonUseCase = {
			execute: jest.fn(),
		};
		listRestaurantAddonsUseCase = {
			execute: jest.fn(),
		};

		controller = new AddonController(
			createAddonUseCase,
			listRestaurantAddonsUseCase,
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
});
