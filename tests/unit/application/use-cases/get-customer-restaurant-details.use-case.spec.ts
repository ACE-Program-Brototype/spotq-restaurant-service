import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GetCustomerRestaurantDetailsUseCase } from "@/application/use-cases/restaurant/get-customer-restaurant-details.use-case.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type {
	CustomerRestaurantDetailsRecord,
	IRestaurantRepository,
} from "@/domain/repositories/restaurant.repository.interface.ts";

describe("GetCustomerRestaurantDetailsUseCase", () => {
	let mockRestaurantRepository: jest.Mocked<IRestaurantRepository>;
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

	beforeEach(() => {
		jest.clearAllMocks();
		mockRestaurantRepository = {
			findCustomerRestaurantDetails: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		useCase = new GetCustomerRestaurantDetailsUseCase(mockRestaurantRepository);
	});

	it("returns safe customer restaurant details including operating hours, location, images, and menu", async () => {
		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			mockRecord,
		);

		const result = await useCase.execute({
			restaurantId: mockRecord.id,
			includeMenu: true,
		});

		expect(result.id).toBe(mockRecord.id);
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
		expect(result.menu[0].items[0].addons).toHaveLength(1);

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
			mockRecord,
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
			mockRecord,
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
			{
				...mockRecord,
				status: "INACTIVE",
			},
		);

		await expect(
			useCase.execute({
				restaurantId: mockRecord.id,
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("throws RestaurantNotFoundError (404) if restaurant is blocked", async () => {
		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			{
				...mockRecord,
				isBlocked: true,
			},
		);

		await expect(
			useCase.execute({
				restaurantId: mockRecord.id,
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("throws RestaurantNotFoundError (404) if restaurant subscription is inactive", async () => {
		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			{
				...mockRecord,
				isSubscriptionActive: false,
			},
		);

		await expect(
			useCase.execute({
				restaurantId: mockRecord.id,
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("throws RestaurantNotFoundError (404) if restaurant onboarding is not COMPLETED", async () => {
		mockRestaurantRepository.findCustomerRestaurantDetails.mockResolvedValueOnce(
			{
				...mockRecord,
				onboardingStatus: "PENDING",
			},
		);

		await expect(
			useCase.execute({
				restaurantId: mockRecord.id,
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});
});
