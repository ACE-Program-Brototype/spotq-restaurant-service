import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { ListRestaurantsUseCase } from "@/application/use-cases/admin/list-restaurants.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";

describe("ListRestaurantsUseCase", () => {
	let mockRestaurantRepository: jest.Mocked<IRestaurantRepository>;
	let useCase: ListRestaurantsUseCase;

	const dummyRestaurant = Restaurant.reconstitute({
		id: "rest-123",
		restaurantName: "Burger Bistro",
		email: "contact@burgerbistro.com",
		phone: "+919876543210",
		ownerName: "John Doe",
		ownerEmail: "john@burgerbistro.com",
		status: "APPROVED",
		onboardingStatus: "COMPLETED",
		emailVerifiedAt: new Date("2026-01-01T10:00:00.000Z"),
		isSubscriptionActive: true,
		subscriptionPlanCode: "QUEUE_PRO",
		subscriptionEndsAt: new Date("2027-01-01T00:00:00.000Z"),
		isBlocked: false,
		blockReason: null,
		createdAt: new Date("2026-01-01T10:00:00.000Z"),
		updatedAt: new Date("2026-01-02T10:00:00.000Z"),
	});

	beforeEach(() => {
		jest.clearAllMocks();
		mockRestaurantRepository = {
			findManyWithFilters: jest.fn(),
			existsByEmail: jest.fn(),
			createRestaurant: jest.fn(),
			findByEmail: jest.fn(),
			findById: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			save: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		useCase = new ListRestaurantsUseCase(mockRestaurantRepository);
	});

	it("should execute repository query with defaults and return snake_case mapped items with pagination", async () => {
		mockRestaurantRepository.findManyWithFilters.mockResolvedValueOnce({
			restaurants: [dummyRestaurant],
			total: 1,
		});

		const result = await useCase.execute({});

		expect(mockRestaurantRepository.findManyWithFilters).toHaveBeenCalledWith({
			page: 1,
			limit: 10,
			search: undefined,
			status: undefined,
			plan: undefined,
			isSubscriptionActive: undefined,
			createdFrom: undefined,
			createdTo: undefined,
			sortBy: "createdAt",
			sortOrder: "desc",
		});

		expect(result.pagination).toEqual({
			page: 1,
			limit: 10,
			total: 1,
			total_pages: 1,
			has_next_page: false,
			has_prev_page: false,
		});

		expect(result.restaurants).toHaveLength(1);
		const item = result.restaurants[0];
		expect(item).toEqual({
			id: "rest-123",
			restaurant: "Burger Bistro",
			restaurant_name: "Burger Bistro",
			owner: "John Doe",
			owner_name: "John Doe",
			contact: {
				email: "contact@burgerbistro.com",
				phone: "+919876543210",
				owner_email: "john@burgerbistro.com",
			},
			plan: "QUEUE_PRO",
			subscription_plan_code: "QUEUE_PRO",
			status: "APPROVED",
			is_subscription_active: true,
			onboarding_status: "COMPLETED",
			is_blocked: false,
			block_reason: null,
			created_at: "2026-01-01T10:00:00.000Z",
			updated_at: "2026-01-02T10:00:00.000Z",
			subscription_ends_at: "2027-01-01T00:00:00.000Z",
		});
	});

	it("should pass search, filter, and pagination parameters to repository", async () => {
		mockRestaurantRepository.findManyWithFilters.mockResolvedValueOnce({
			restaurants: [],
			total: 0,
		});

		const queryParams = {
			page: 2,
			limit: 20,
			search: "burger",
			status: "PENDING" as const,
			plan: "SELF_SERVICE_PRO" as const,
			isSubscriptionActive: false,
			sortBy: "restaurantName" as const,
			sortOrder: "asc" as const,
		};

		const result = await useCase.execute(queryParams);

		expect(mockRestaurantRepository.findManyWithFilters).toHaveBeenCalledWith({
			page: 2,
			limit: 20,
			search: "burger",
			status: "PENDING",
			plan: "SELF_SERVICE_PRO",
			isSubscriptionActive: false,
			createdFrom: undefined,
			createdTo: undefined,
			sortBy: "restaurantName",
			sortOrder: "asc",
		});

		expect(result.pagination).toEqual({
			page: 2,
			limit: 20,
			total: 0,
			total_pages: 0,
			has_next_page: false,
			has_prev_page: true,
		});
		expect(result.restaurants).toEqual([]);
	});
});
