import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IQueueService } from "@/application/ports/services/queue.service.port.ts";
import { GetCustomerRestaurantDetailsUseCase } from "@/application/use-cases/restaurant/get-customer-restaurant-details.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type {
	CustomerRestaurantDetailsRecord,
	IRestaurantRepository,
} from "@/domain/repositories/restaurant.repository.interface.ts";

describe("GetCustomerRestaurantDetailsUseCase", () => {
	let mockRestaurantRepository: jest.Mocked<IRestaurantRepository>;
	let mockQueueService: jest.Mocked<IQueueService>;
	let mockLogger: { error: jest.Mock };
	let useCase: GetCustomerRestaurantDetailsUseCase;

	const mockRecord: CustomerRestaurantDetailsRecord = {
		id: "123e4567-e89b-12d3-a456-426614174000",
		restaurantName: "Biryani Express",
		email: "info@biryaniexpress.com",
		phone: "+919876543210",
		status: "ACTIVE",
		isBlocked: false,
		isSubscriptionActive: true,
		onboardingStatus: "COMPLETED",
		address: {
			id: "addr-1",
			addressLine1: "123 Food Street",
			addressLine2: "Near Clock Tower",
			city: "Calicut",
			state: "Kerala",
			country: "India",
			pincode: "673001",
			latitude: 11.2588,
			longitude: 75.7804,
		},
		profile: {
			description: "Authentic Dum Biryani",
			cuisineType: "Malabar, South Indian",
			averageCost: 400,
			coverImageKey: "restaurants/covers/cover-1.jpg",
		},
		settings: {
			isOpened: true,
			isPreorder: false,
			acceptsQueue: true,
			acceptsQrOrders: true,
		},
		operatingHours: [
			{
				id: "oh-1",
				dayOfWeek: 1,
				isOpen: true,
				isClosed: false,
				openTime: new Date("1970-01-01T10:00:00.000Z"),
				closeTime: new Date("1970-01-01T23:00:00.000Z"),
			},
		],
		images: [
			{
				id: "img-1",
				objectKey: "restaurants/images/gallery-1.jpg",
				displayOrder: 1,
			},
		],
		menuCategories: [
			{
				id: "cat-1",
				name: "Biryani",
				description: "Our signature biryanis",
				displayOrder: 1,
				menuItems: [
					{
						id: "item-1",
						categoryId: "cat-1",
						name: "Chicken Dum Biryani",
						description: "Slow cooked fragrant rice and chicken",
						price: 250,
						preparationTime: 20,
						calories: 650,
						isVegetarian: false,
						isFeatured: true,
						isAvailable: true,
						images: [
							{
								id: "item-img-1",
								objectKey: "menu/chicken-biryani.jpg",
								displayOrder: 1,
							},
						],
						variants: [
							{
								id: "var-1",
								sku: "CB-FULL",
								name: "Full Portion",
								price: 250,
								isDefault: true,
								isAvailable: true,
							},
						],
						addons: [
							{
								id: "addon-map-1",
								addonId: "addon-1",
								name: "Extra Raita",
								description: "Creamy cucumber raita",
								price: 30,
								priceOverride: null,
								imageKey: null,
								isAvailable: true,
							},
						],
					},
				],
			},
		],
	};

	const createRestaurantResult = (
		overrides: {
			status?: string;
			isBlocked?: boolean;
			isSubscriptionActive?: boolean;
			onboardingStatus?: string;
			subscriptionEndsAt?: Date | null;
		} = {},
	): CustomerRestaurantDetailsRecord => {
		const status = overrides.status ?? "ACTIVE";
		const isBlocked = overrides.isBlocked ?? false;
		const isSubscriptionActive = overrides.isSubscriptionActive ?? true;
		const onboardingStatus = overrides.onboardingStatus ?? "COMPLETED";
		const subscriptionEndsAt =
			overrides.subscriptionEndsAt !== undefined
				? overrides.subscriptionEndsAt
				: null;

		const restaurantEntity = Restaurant.reconstitute({
			id: mockRecord.id,
			restaurantName: mockRecord.restaurantName,
			email: mockRecord.email,
			phone: mockRecord.phone,
			ownerName: "Owner Name",
			ownerEmail: "owner@test.com",
			status,
			onboardingStatus,
			emailVerifiedAt: new Date(),
			isSubscriptionActive,
			subscriptionEndsAt,
			isBlocked,
			blockReason: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		return {
			...mockRecord,
			...overrides,
			restaurant: restaurantEntity,
		};
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockRestaurantRepository = {
			findCustomerRestaurantDetails: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockQueueService = {
			getQueueStatus: jest.fn().mockResolvedValue(null),
		} as unknown as jest.Mocked<IQueueService>;
		mockLogger = { error: jest.fn() };

		useCase = new GetCustomerRestaurantDetailsUseCase(
			mockRestaurantRepository,
			mockQueueService,
			mockLogger as never,
		);
	});

	it("returns safe customer restaurant details including operating hours, location, images, and menu", async () => {
		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			createRestaurantResult(),
		);

		const result = await useCase.execute({
			restaurantId: mockRecord.id,
			includeMenu: true,
		});

		expect(result.restaurantId).toBe(mockRecord.id);
		expect(result.restaurantName).toBe("Biryani Express");
		expect(result.phone).toBe("+919876543210");
		expect(result.email).toBe("info@biryaniexpress.com");
		expect(result.description).toBe("Authentic Dum Biryani");
		expect(result.cuisineType).toBe("Malabar, South Indian");
		expect(result.averageCost).toBe(400);
		expect(result.coverImage).toBe("restaurants/covers/cover-1.jpg");

		// Location
		expect(result.address).toEqual({
			id: "addr-1",
			addressLine1: "123 Food Street",
			addressLine2: "Near Clock Tower",
			city: "Calicut",
			state: "Kerala",
			country: "India",
			pincode: "673001",
			latitude: 11.2588,
			longitude: 75.7804,
		});

		// Settings
		expect(result.settings).toEqual({
			isOpened: true,
			isPreorder: false,
			acceptsQueue: true,
			acceptsQrOrders: true,
		});

		// Operating Hours & Images
		expect(result.operatingHours).toHaveLength(1);
		expect(result.operatingHours[0].dayOfWeek).toBe(1);
		expect(result.images).toHaveLength(1);

		// Menu Categories, Items, Variants & Addons
		expect(result.menu).toHaveLength(1);
		expect(result.menu[0].name).toBe("Biryani");
		expect(result.menu[0].items).toHaveLength(1);
		expect(result.menu[0].items[0].name).toBe("Chicken Dum Biryani");
		expect(result.menu[0].items[0].price).toBe(250);
		expect(result.menu[0].items[0].variants).toHaveLength(1);
		expect(result.menu[0].items[0].variants[0]).toEqual({
			id: "var-1",
			name: "Full Portion",
			price: 250,
			isDefault: true,
			isAvailable: true,
		});
		expect(result.menu[0].items[0].addons).toHaveLength(1);
		expect(result.menu[0].items[0].addons[0]).toEqual({
			id: "addon-map-1",
			addonId: "addon-1",
			name: "Extra Raita",
			description: "Creamy cucumber raita",
			price: 30,
			imageKey: null,
			isAvailable: true,
		});

		// Verify isClosed is omitted from operatingHours
		expect(
			(result.operatingHours[0] as unknown as Record<string, unknown>).isClosed,
		).toBeUndefined();

		// Verify sensitive internal fields are NOT present on output
		const rawOutput = result as unknown as Record<string, unknown>;
		expect(rawOutput.ownerName).toBeUndefined();
		expect(rawOutput.ownerEmail).toBeUndefined();
		expect(rawOutput.fssaiNumber).toBeUndefined();
		expect(rawOutput.gstNumber).toBeUndefined();
		expect(rawOutput.rejectionReason).toBeUndefined();
		expect(rawOutput.blockReason).toBeUndefined();
		expect(rawOutput.status).toBeUndefined();
		expect(rawOutput.isBlocked).toBeUndefined();
		expect(rawOutput.isSubscriptionActive).toBeUndefined();
		expect(rawOutput.onboardingStatus).toBeUndefined();
	});

	it("omits menu items when includeMenu is false", async () => {
		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			createRestaurantResult(),
		);

		const result = await useCase.execute({
			restaurantId: mockRecord.id,
			includeMenu: false,
		});

		expect(result.menu).toEqual([]);
		expect(
			mockRestaurantRepository.findCustomerRestaurantDetails,
		).toHaveBeenCalledWith({
			restaurantId: mockRecord.id,
			includeMenu: false,
			categoryId: undefined,
		});
	});

	it("passes categoryId filter to repository", async () => {
		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			createRestaurantResult(),
		);

		await useCase.execute({
			restaurantId: mockRecord.id,
			includeMenu: true,
			categoryId: "cat-1",
		});

		expect(
			mockRestaurantRepository.findCustomerRestaurantDetails,
		).toHaveBeenCalledWith({
			restaurantId: mockRecord.id,
			includeMenu: true,
			categoryId: "cat-1",
		});
	});

	it("throws RestaurantNotFoundError (404) if restaurant does not exist", async () => {
		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			null,
		);

		await expect(
			useCase.execute({
				restaurantId: "123e4567-e89b-12d3-a456-426614174000",
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("throws RestaurantNotFoundError (404) if restaurant is not ACTIVE", async () => {
		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			createRestaurantResult({ status: "INACTIVE" }),
		);

		await expect(
			useCase.execute({
				restaurantId: mockRecord.id,
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("throws RestaurantNotFoundError (404) if restaurant is blocked", async () => {
		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			createRestaurantResult({ isBlocked: true }),
		);

		await expect(
			useCase.execute({
				restaurantId: mockRecord.id,
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("throws RestaurantNotFoundError (404) if restaurant subscription is inactive", async () => {
		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			createRestaurantResult({ isSubscriptionActive: false }),
		);

		await expect(
			useCase.execute({
				restaurantId: mockRecord.id,
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("throws RestaurantNotFoundError (404) if restaurant onboarding is not COMPLETED", async () => {
		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			createRestaurantResult({ onboardingStatus: "PENDING" }),
		);

		await expect(
			useCase.execute({
				restaurantId: mockRecord.id,
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("throws RestaurantNotFoundError if the subscription has expired", async () => {
		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			createRestaurantResult({
				subscriptionEndsAt: new Date("2020-01-01T00:00:00.000Z"),
			}),
		);

		await expect(
			useCase.execute({
				restaurantId: mockRecord.id,
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("retrieves queue status and user membership when restaurant accepts queue", async () => {
		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			createRestaurantResult(),
		);

		const mockQueueStatus = {
			isOpen: true,
			activeWaiters: 3,
			estimatedWaitMinutes: 15,
			membership: {
				hasActiveQueue: true,
				isCurrentRestaurantQueue: true,
				queueEntryId: "entry-1",
				queueNumber: "A-01",
				partySize: 2,
				status: "WAITING",
				position: 3,
				estimatedWaitMinutes: 15,
				joinedAt: new Date(),
			},
		};

		mockQueueService.getQueueStatus.mockResolvedValueOnce(mockQueueStatus);

		const result = await useCase.execute({
			restaurantId: mockRecord.id,
			userId: "user-123",
		});

		expect(mockQueueService.getQueueStatus).toHaveBeenCalledWith({
			restaurantId: mockRecord.id,
			userId: "user-123",
		});
		expect(result.queue).toEqual(mockQueueStatus);
	});

	it("gracefully degrades when queue service throws an error", async () => {
		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			createRestaurantResult(),
		);

		mockQueueService.getQueueStatus.mockRejectedValueOnce(
			new Error("Queue service timeout"),
		);

		const result = await useCase.execute({
			restaurantId: mockRecord.id,
			userId: "user-123",
		});

		expect(result.queue).toEqual({
			isGuestUser: false,
			hasJoinedAnyQueue: null,
			hasJoinedThisRestaurantQueue: null,
			isQueueStatusAvailable: false,
		});
		expect(mockLogger.error).toHaveBeenCalledWith(
			"[ERROR]: Cannot connect to Queue Service",
		);
	});

	it("skips queue service when restaurant settings indicate acceptsQueue is false", async () => {
		const customRecord = createRestaurantResult();
		customRecord.settings = {
			isOpened: true,
			isPreorder: false,
			acceptsQueue: false,
			acceptsQrOrders: true,
		};

		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			customRecord,
		);

		const result = await useCase.execute({
			restaurantId: mockRecord.id,
		});

		expect(mockQueueService.getQueueStatus).not.toHaveBeenCalled();
		expect(result.queue).toBeNull();
	});
});
