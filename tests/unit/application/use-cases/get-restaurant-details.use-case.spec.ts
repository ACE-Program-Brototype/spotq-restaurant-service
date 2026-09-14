import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { RestaurantDetailsResponseDto } from "@/application/dtos/admin/restaurant-details.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { GetRestaurantDetailsUseCase } from "@/application/use-cases/admin/get-restaurant-details.use-case.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";

describe("GetRestaurantDetailsUseCase", () => {
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let useCase: GetRestaurantDetailsUseCase;

	const dummyDetails: RestaurantDetailsResponseDto = {
		id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		restaurantName: "Spice Route Bistro",
		category: "North Indian",
		email: "contact@spiceroute.com",
		phone: "+919876543210",
		ownerName: "Alice Smith",
		ownerEmail: "alice@spiceroute.com",
		status: "APPROVED",
		onboardingStatus: "COMPLETED",
		isBlocked: false,
		blockReason: null,
		isSubscriptionActive: true,
		subscriptionPlanCode: "QUEUE_PRO",
		subscriptionEndsAt: new Date("2026-12-31T23:59:59.999Z"),
		lastLoginAt: new Date("2026-03-01T10:00:00.000Z"),
		createdAt: new Date("2026-01-01T00:00:00.000Z"),
		updatedAt: new Date("2026-01-02T00:00:00.000Z"),
		address: {
			id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
			addressLine1: "123 Food Street",
			addressLine2: "Suite 4B",
			city: "Kochi",
			state: "Kerala",
			country: "India",
			pincode: "682001",
			latitude: 9.9312,
			longitude: 76.2673,
		},
		settings: {
			isOpened: true,
			isPreorder: false,
			isLoyaltyEnabled: true,
			cuisineType: "North Indian",
			seatingCapacity: 60,
			openTime: new Date("1970-01-01T09:00:00.000Z"),
			closeTime: new Date("1970-01-01T22:00:00.000Z"),
		},
		profile: {
			coverImage: "restaurants/cover.jpg",
			avatar: "restaurants/avatar.jpg",
			description: "Authentic North Indian Dining",
			fssaiNumber: "12345678901234",
			registerNumber: "REG-998877",
			gstNumber: "32ABCDE1234F1Z5",
		},
		operatingHours: [
			{
				id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
				dayOfWeek: 1,
				isOpen: true,
				openTime: new Date("1970-01-01T09:00:00.000Z"),
				closeTime: new Date("1970-01-01T22:00:00.000Z"),
			},
		],
		staff: [
			{
				id: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
				fullname: "Bob Chef",
				email: "bob@spiceroute.com",
				phone: "+919876543211",
				role: "STAFF",
				status: "ACTIVE",
				avatarUrl: "staff/bob.jpg",
				createdAt: new Date("2026-01-05T00:00:00.000Z"),
			},
		],
		documents: [
			{
				id: "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
				documentType: "FSSAI",
				documentName: "fssai_cert.pdf",
				documentKey: "docs/fssai.pdf",
				verificationStatus: "VERIFIED",
				uploadedAt: new Date("2026-01-02T00:00:00.000Z"),
			},
		],
		images: [
			{
				id: "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
				objectKey: "images/interior.jpg",
				displayOrder: 1,
				createdAt: new Date("2026-01-03T00:00:00.000Z"),
			},
		],
		linkedAccount: {
			email: "alice@spiceroute.com",
			phone: "+919876543210",
			isEmailVerified: true,
			lastLoginAt: new Date("2026-03-01T10:00:00.000Z"),
		},
	};

	beforeEach(() => {
		restaurantRepository = {
			create: jest.fn(),
			createRestaurant: jest.fn(),
			findById: jest.fn(),
			findCompletedDetailsById: jest.fn(),
			findUnique: jest.fn(),
			find: jest.fn(),
			update: jest.fn(),
			existsByEmail: jest.fn(),
			findByEmail: jest.fn(),
			updateLastLogin: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		useCase = new GetRestaurantDetailsUseCase(restaurantRepository);
	});

	it("should retrieve completed restaurant details successfully", async () => {
		restaurantRepository.findCompletedDetailsById.mockResolvedValue(
			dummyDetails,
		);

		const result = await useCase.execute(
			"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		);

		expect(
			restaurantRepository.findCompletedDetailsById,
		).toHaveBeenCalledWith("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
		expect(result).toEqual(dummyDetails);
		expect(result.id).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
		expect(result.restaurantName).toBe("Spice Route Bistro");
		expect(result.onboardingStatus).toBe("COMPLETED");
	});

	it("should return empty arrays for staff, documents, and images when not present (AC11)", async () => {
		const minimalDetails: RestaurantDetailsResponseDto = {
			...dummyDetails,
			staff: [],
			documents: [],
			images: [],
			operatingHours: [],
			lastLoginAt: null,
			linkedAccount: {
				...dummyDetails.linkedAccount,
				lastLoginAt: null,
			},
		};

		restaurantRepository.findCompletedDetailsById.mockResolvedValue(
			minimalDetails,
		);

		const result = await useCase.execute(
			"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		);

		expect(result.staff).toEqual([]);
		expect(result.documents).toEqual([]);
		expect(result.images).toEqual([]);
		expect(result.operatingHours).toEqual([]);
		expect(result.lastLoginAt).toBeNull();
		expect(result.linkedAccount.lastLoginAt).toBeNull();
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist or onboarding is pending (AC13)", async () => {
		restaurantRepository.findCompletedDetailsById.mockResolvedValue(null);

		await expect(
			useCase.execute("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"),
		).rejects.toThrow(RestaurantNotFoundError);
	});
});
