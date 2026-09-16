import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { ListStaffMembersUseCase } from "@/application/use-cases/staff/list-staff-members.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import { RestaurantNotFoundError } from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

describe("ListStaffMembersUseCase", () => {
	let useCase: ListStaffMembersUseCase;
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;

	const mockRestaurantId = "33333333-3333-3333-3333-333333333333";
	const mockOwnerEmail = "owner@spotq.com";

	const mockRestaurant = Restaurant.reconstitute({
		id: mockRestaurantId,
		restaurantName: "Test Restaurant",
		email: "restaurant@spotq.com",
		phone: "9876543210",
		ownerName: "Owner Name",
		ownerEmail: mockOwnerEmail,
		status: "ACTIVE",
		onboardingStatus: "COMPLETED",
		emailVerifiedAt: new Date(),
		isBlocked: false,
		blockReason: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	const mockStaffList = [
		RestaurantStaff.reconstitute({
			id: "staff-1",
			restaurantId: mockRestaurantId,
			fullname: "Ravi Kumar",
			email: "ravi@example.com",
			phone: "9876543211",
			passwordHash: "hash1",
			role: "STAFF",
			status: "ACTIVE",
			avatarUrl: null,
			createdAt: new Date("2026-01-02"),
			updatedAt: new Date("2026-01-02"),
		}),
		RestaurantStaff.reconstitute({
			id: "staff-2",
			restaurantId: mockRestaurantId,
			fullname: "Arun Sharma",
			email: "arun@example.com",
			phone: "9876543212",
			passwordHash: "hash2",
			role: "STAFF",
			status: "INACTIVE",
			avatarUrl: null,
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
		}),
	];

	beforeEach(() => {
		staffRepository = {
			create: jest.fn(),
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByRestaurantId: jest.fn(),
			findManyWithFilters: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantStaffRepository>;

		restaurantRepository = {
			create: jest.fn(),
			findById: jest.fn(),
			findByEmail: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		useCase = new ListStaffMembersUseCase(
			staffRepository,
			restaurantRepository,
		);
	});

	it("should return staff list with default pagination and sorting", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findManyWithFilters.mockResolvedValue({
			staff: mockStaffList,
			total: 2,
		});

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
			ownerEmail: mockOwnerEmail,
		});

		expect(restaurantRepository.findById).toHaveBeenCalledWith(
			mockRestaurantId,
		);
		expect(staffRepository.findManyWithFilters).toHaveBeenCalledWith({
			restaurantId: mockRestaurantId,
			page: 1,
			limit: 20,
			status: undefined,
			search: undefined,
			sortBy: "createdAt",
			sortOrder: "desc",
		});

		expect(result.staff).toHaveLength(2);
		expect(result.staff[0]).toEqual({
			id: "staff-1",
			fullname: "Ravi Kumar",
			email: "ravi@example.com",
			status: "ACTIVE",
		});
		expect(result.pagination).toEqual({
			page: 1,
			limit: 20,
			total: 2,
			totalPages: 1,
			hasNextPage: false,
			hasPrevPage: false,
		});
	});

	it("should filter by status, search query, and custom sort order", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findManyWithFilters.mockResolvedValue({
			staff: [mockStaffList[0]],
			total: 1,
		});

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
			ownerEmail: mockOwnerEmail,
			status: "ACTIVE",
			search: "ravi",
			page: 2,
			limit: 5,
			sortOrder: "ASC",
		});

		expect(staffRepository.findManyWithFilters).toHaveBeenCalledWith({
			restaurantId: mockRestaurantId,
			page: 2,
			limit: 5,
			status: "ACTIVE",
			search: "ravi",
			sortBy: "createdAt",
			sortOrder: "asc",
		});

		expect(result.staff).toHaveLength(1);
		expect(result.staff[0].fullname).toBe("Ravi Kumar");
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-id",
				ownerEmail: mockOwnerEmail,
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("should return staff list when ownerEmail is omitted", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findManyWithFilters.mockResolvedValue({
			staff: mockStaffList,
			total: 2,
		});

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
		});

		expect(result.staff).toHaveLength(2);
	});

	it("should return empty array and valid pagination when count is 0", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffRepository.findManyWithFilters.mockResolvedValue({
			staff: [],
			total: 0,
		});

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
			ownerEmail: mockOwnerEmail,
		});

		expect(result.staff).toHaveLength(0);
		expect(result.pagination.total).toBe(0);
		expect(result.pagination.totalPages).toBe(0);
	});
});
