import { ListRestaurantApplicationsUseCase } from "@/application/use-cases/admin/list-restaurant-applications.use-case.ts";
import type {
	IRestaurantRepository,
	RestaurantApplicationDetail,
} from "@/application/ports/repositories/restaurant.repository.port.ts";

describe("ListRestaurantApplicationsUseCase", () => {
	let useCase: ListRestaurantApplicationsUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;

	const mockRestaurant1: RestaurantApplicationDetail = {
		id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
		restaurantName: "Pending Bistro",
		email: "bistro@example.com",
		phone: "+1234567890",
		ownerName: "Alice Smith",
		ownerEmail: "alice@example.com",
		status: "PENDING",
		onboardingStatus: "COMPLETED",
		emailVerifiedAt: new Date(),
		rejectionReason: null,
		createdAt: new Date("2026-03-01T00:00:00Z"),
		updatedAt: new Date("2026-03-01T00:00:00Z"),
		address: null,
		documents: [],
		images: [],
	};

	const mockRestaurant2: RestaurantApplicationDetail = {
		id: "a11ac10b-58cc-4372-a567-0e02b2c3d480",
		restaurantName: "Rejected Diner",
		email: "diner@example.com",
		phone: "+1234567891",
		ownerName: "Bob Jones",
		ownerEmail: "bob@example.com",
		status: "REJECTED",
		onboardingStatus: "COMPLETED",
		emailVerifiedAt: new Date(),
		rejectionReason: "Invalid license",
		createdAt: new Date("2026-03-02T00:00:00Z"),
		updatedAt: new Date("2026-03-02T00:00:00Z"),
		address: null,
		documents: [],
		images: [],
	};

	beforeEach(() => {
		mockRestaurantRepo = {
			findByEmail: jest.fn(),
			createRestaurant: jest.fn(),
			existsByEmail: jest.fn(),
			findById: jest.fn(),
			findUnique: jest.fn(),
			find: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			save: jest.fn(),
			findApplicationsWithFilters: jest.fn(),
			findByIdWithDetails: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		useCase = new ListRestaurantApplicationsUseCase(mockRestaurantRepo);
	});

	it("should execute repository query with default parameters when none provided", async () => {
		mockRestaurantRepo.findApplicationsWithFilters.mockResolvedValue({
			restaurants: [mockRestaurant1, mockRestaurant2],
			total: 2,
		});

		const result = await useCase.execute({});

		expect(mockRestaurantRepo.findApplicationsWithFilters).toHaveBeenCalledWith({
			page: 1,
			limit: 10,
			status: undefined,
			search: undefined,
			sortBy: "createdAt",
			sortOrder: "desc",
		});

		expect(result.restaurants).toHaveLength(2);
		expect(result.pagination).toEqual({
			page: 1,
			limit: 10,
			total: 2,
			totalPages: 1,
			hasNextPage: false,
			hasPrevPage: false,
		});
	});

	it("should pass custom filters, search, and pagination to repository", async () => {
		const fromDate = new Date("2026-03-01T00:00:00Z");
		const toDate = new Date("2026-03-31T23:59:59Z");

		mockRestaurantRepo.findApplicationsWithFilters.mockResolvedValue({
			restaurants: [mockRestaurant1],
			total: 25,
		});

		const result = await useCase.execute({
			page: 2,
			limit: 10,
			status: "PENDING",
			search: "  bistro  ",
			fromDate,
			toDate,
			sortBy: "restaurantName",
			sortOrder: "asc",
		});

		expect(mockRestaurantRepo.findApplicationsWithFilters).toHaveBeenCalledWith({
			page: 2,
			limit: 10,
			status: "PENDING",
			search: "bistro",
			fromDate,
			toDate,
			sortBy: "restaurantName",
			sortOrder: "asc",
		});

		expect(result.pagination).toEqual({
			page: 2,
			limit: 10,
			total: 25,
			totalPages: 3,
			hasNextPage: true,
			hasPrevPage: true,
		});
	});
});
