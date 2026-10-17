import type { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { DomainError } from "@/domain/errors/domain.error";
import {
	IdempotentEventAlreadyProcessedError,
	InvalidRestaurantDataError,
	RestaurantAlreadyExistsError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors";
import { RestaurantRepository } from "@/infrastructure/database/repositories/restaurant.repository";
import { PersistenceError } from "@/infrastructure/errors/persistence.error";

describe("RestaurantRepository", () => {
	let mockPrisma: {
		restaurant: {
			findUnique: jest.Mock;
			create: jest.Mock;
			update: jest.Mock;
			findMany: jest.Mock;
			count: jest.Mock;
			upsert: jest.Mock;
			findFirst: jest.Mock;
		};
		processedEvent: {
			findUnique: jest.Mock;
			create: jest.Mock;
		};
		$transaction: jest.Mock;
	};
	let repository: RestaurantRepository;

	beforeEach(() => {
		mockPrisma = {
			restaurant: {
				findUnique: jest.fn(),
				create: jest.fn(),
				update: jest.fn(),
				findMany: jest.fn(),
				count: jest.fn(),
				upsert: jest.fn(),
				findFirst: jest.fn(),
			},
			processedEvent: {
				findUnique: jest.fn(),
				create: jest.fn(),
			},
			$transaction: jest.fn(),
		};
		repository = new RestaurantRepository(
			mockPrisma as unknown as PrismaClient,
		);
		jest.clearAllMocks();
	});

	describe("error translation via errorMap", () => {
		it("should translate P2002 error in create to RestaurantAlreadyExistsError", async () => {
			const p2002Error = new PrismaClientKnownRequestError(
				"Unique constraint failed on the fields: (`email`)",
				{
					code: "P2002",
					clientVersion: "6.19.3",
				},
			);
			mockPrisma.restaurant.create.mockRejectedValueOnce(p2002Error);

			await expect(
				repository.create({
					restaurantName: "Test Restaurant",
					email: "existing@example.com",
					phone: "9876543210",
					ownerName: "John Doe",
					ownerEmail: "owner@example.com",
				}),
			).rejects.toThrow(RestaurantAlreadyExistsError);
		});

		it("should translate P2002 error with phone target to InvalidRestaurantDataError", async () => {
			const p2002Error = new PrismaClientKnownRequestError(
				"Unique constraint failed on the fields: (`phone`)",
				{
					code: "P2002",
					clientVersion: "6.19.3",
					meta: { target: ["phone"] },
				},
			);
			mockPrisma.restaurant.create.mockRejectedValueOnce(p2002Error);

			await expect(
				repository.create({
					restaurantName: "Test Restaurant",
					email: "unique@example.com",
					phone: "9876543210",
					ownerName: "John Doe",
					ownerEmail: "owner@example.com",
				}),
			).rejects.toThrow(InvalidRestaurantDataError);
		});

		it("should translate P2025 error in update to RestaurantNotFoundError", async () => {
			const p2025Error = new PrismaClientKnownRequestError(
				"Record to update not found",
				{
					code: "P2025",
					clientVersion: "6.19.3",
				},
			);
			mockPrisma.restaurant.update.mockRejectedValueOnce(p2025Error);

			await expect(
				repository.update("non-existent-id", {
					restaurantName: "Updated Name",
				}),
			).rejects.toThrow(RestaurantNotFoundError);
		});

		it("should wrap unmapped database error in PersistenceError", async () => {
			const dbError = new Error("Connection terminated unexpectedly");
			mockPrisma.restaurant.findUnique.mockRejectedValueOnce(dbError);

			await expect(repository.findByEmail("test@example.com")).rejects.toThrow(
				PersistenceError,
			);
		});

		it("RestaurantAlreadyExistsError should be an instance of DomainError", () => {
			const err = new RestaurantAlreadyExistsError();
			expect(err).toBeInstanceOf(DomainError);
			expect(err).toBeInstanceOf(Error);
			expect(err.message).toBe("Restaurant with this email already exists");
		});

		it("IdempotentEventAlreadyProcessedError should be an instance of DomainError with code and message", () => {
			const err = new IdempotentEventAlreadyProcessedError();
			expect(err).toBeInstanceOf(DomainError);
			expect(err).toBeInstanceOf(Error);
			expect(err.code).toBe("IDEMPOTENT_EVENT_ALREADY_PROCESSED");
			expect(err.message).toBe("Event has already been processed");
		});
	});

	describe("activateSubscription", () => {
		it("should update restaurant and record processed event within transaction returning true", async () => {
			mockPrisma.$transaction.mockImplementation(async (callback) => {
				const tx = {
					processedEvent: {
						findUnique: jest.fn().mockResolvedValue(null),
						create: jest.fn().mockResolvedValue({ id: "evt-1" }),
					},
					restaurant: {
						update: jest.fn().mockResolvedValue({ id: "rest-1" }),
					},
				};
				return await callback(tx);
			});

			const result = await repository.activateSubscription(
				"rest-1",
				"QUEUE_PRO",
				new Date("2026-10-01T00:00:00.000Z"),
				"evt-1",
			);

			expect(result).toBe(true);
			expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
		});

		it("should return false if event was already processed inside transaction", async () => {
			mockPrisma.$transaction.mockImplementation(async (callback) => {
				const tx = {
					processedEvent: {
						findUnique: jest.fn().mockResolvedValue({ id: "evt-already" }),
						create: jest.fn(),
					},
					restaurant: {
						update: jest.fn(),
					},
				};
				return await callback(tx);
			});

			const result = await repository.activateSubscription(
				"rest-1",
				"QUEUE_PRO",
				new Date("2026-10-01T00:00:00.000Z"),
				"evt-already",
			);

			expect(result).toBe(false);
		});

		it("should catch P2002 duplicate key constraint and return false idempotently", async () => {
			const p2002Error = new PrismaClientKnownRequestError(
				"Unique constraint failed on the fields: (`id`)",
				{
					code: "P2002",
					clientVersion: "6.19.3",
				},
			);

			mockPrisma.$transaction.mockRejectedValueOnce(p2002Error);

			const result = await repository.activateSubscription(
				"rest-1",
				"QUEUE_PRO",
				new Date("2026-10-01T00:00:00.000Z"),
				"evt-concurrent",
			);

			expect(result).toBe(false);
		});

		it("should rethrow unexpected database errors as PersistenceError", async () => {
			const dbError = new Error("Database connection failure");
			mockPrisma.$transaction.mockRejectedValueOnce(dbError);

			await expect(
				repository.activateSubscription(
					"rest-1",
					"QUEUE_PRO",
					new Date("2026-10-01T00:00:00.000Z"),
					"evt-err",
				),
			).rejects.toThrow("Database connection failure");
		});
	});

	describe("findCustomerRestaurantDetails", () => {
		const restaurantId = "123e4567-e89b-12d3-a456-426614174000";

		it("should query Prisma with restaurantId constraint on addons and active/non-deleted filters", async () => {
			mockPrisma.restaurant.findFirst.mockResolvedValueOnce({
				id: restaurantId,
				restaurantName: "Test Diner",
				email: "diner@test.com",
				phone: "+919876543210",
				status: "ACTIVE",
				isBlocked: false,
				isSubscriptionActive: true,
				onboardingStatus: "COMPLETED",
				address: {
					id: "addr-1",
					addressLine1: "123 Main St",
					addressLine2: null,
					city: "Kochi",
					state: "Kerala",
					country: "India",
					pincode: "682001",
					latitude: 9.9312,
					longitude: 76.2673,
				},
				profile: {
					description: "Best test diner",
					cuisineType: "Continental",
					averageCost: 500,
					coverImageKey: "covers/diner.jpg",
				},
				settings: {
					isOpened: true,
					isPreorder: false,
					acceptsQueue: true,
					acceptsQrOrders: true,
				},
				operatingHours: [],
				images: [],
				menuCategories: [
					{
						id: "cat-1",
						name: "Burgers",
						description: "Delicious burgers",
						displayOrder: 1,
						menuItems: [
							{
								id: "item-1",
								categoryId: "cat-1",
								name: "Cheese Burger",
								description: "Beef and cheese",
								price: 200,
								preparationTime: 15,
								calories: 500,
								isVegetarian: false,
								isFeatured: true,
								isAvailable: true,
								images: [],
								variants: [],
								addons: [
									{
										id: "link-1",
										priceOverride: 30,
										addon: {
											id: "addon-1",
											name: "Extra Cheese",
											description: "Melted cheddar",
											price: 25,
											imageKey: "addons/cheese.jpg",
											isAvailable: true,
										},
									},
								],
							},
						],
					},
				],
			});

			const result = await repository.findCustomerRestaurantDetails({
				restaurantId,
				includeMenu: true,
			});

			expect(mockPrisma.restaurant.findFirst).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						id: restaurantId,
						status: "ACTIVE",
						isBlocked: false,
						isSubscriptionActive: true,
						onboardingStatus: "COMPLETED",
					},
					select: expect.objectContaining({
						menuCategories: expect.objectContaining({
							where: {
								isDeleted: false,
								isActive: true,
							},
							select: expect.objectContaining({
								menuItems: expect.objectContaining({
									where: {
										isDeleted: false,
										isAvailable: true,
									},
									select: expect.objectContaining({
										addons: expect.objectContaining({
											where: {
												addon: {
													restaurantId,
													isDeleted: false,
													isAvailable: true,
												},
											},
										}),
									}),
								}),
							}),
						}),
					}),
				}),
			);

			expect(result).not.toBeNull();
			expect(result?.menuCategories[0].menuItems[0].addons[0]).toEqual({
				id: "link-1",
				addonId: "addon-1",
				name: "Extra Cheese",
				description: "Melted cheddar",
				price: 25,
				priceOverride: 30,
				imageKey: "addons/cheese.jpg",
				isAvailable: true,
			});
		});

		it("should filter by categoryId when provided in params", async () => {
			mockPrisma.restaurant.findFirst.mockResolvedValueOnce(null);

			await repository.findCustomerRestaurantDetails({
				restaurantId,
				includeMenu: true,
				categoryId: "cat-specific-id",
			});

			expect(mockPrisma.restaurant.findFirst).toHaveBeenCalledWith(
				expect.objectContaining({
					select: expect.objectContaining({
						menuCategories: expect.objectContaining({
							where: {
								isDeleted: false,
								isActive: true,
								id: "cat-specific-id",
							},
						}),
					}),
				}),
			);
		});

		it("should omit menuCategories from query select when includeMenu is false", async () => {
			mockPrisma.restaurant.findFirst.mockResolvedValueOnce({
				id: restaurantId,
				restaurantName: "Test Diner",
				email: "diner@test.com",
				phone: "+919876543210",
				status: "ACTIVE",
				isBlocked: false,
				isSubscriptionActive: true,
				onboardingStatus: "COMPLETED",
				address: null,
				profile: null,
				settings: null,
				operatingHours: [],
				images: [],
			});

			const result = await repository.findCustomerRestaurantDetails({
				restaurantId,
				includeMenu: false,
			});

			expect(mockPrisma.restaurant.findFirst).toHaveBeenCalledWith(
				expect.objectContaining({
					select: expect.not.objectContaining({
						menuCategories: expect.anything(),
					}),
				}),
			);
			expect(result?.menuCategories).toEqual([]);
		});
	});
});
