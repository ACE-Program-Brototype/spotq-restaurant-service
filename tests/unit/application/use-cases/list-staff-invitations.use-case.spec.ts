import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { ListStaffInvitationsUseCase } from "@/application/use-cases/staff/list-staff-invitations.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { StaffInvitation } from "@/domain/entities/staff-invitation.entity.ts";
import {
	RestaurantAccountBlockedError,
	RestaurantInactiveError,
	RestaurantNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IStaffInvitationRepository } from "@/domain/repositories/staff-invitation.repository.interface.ts";

describe("ListStaffInvitationsUseCase", () => {
	let staffInvitationRepository: jest.Mocked<IStaffInvitationRepository>;
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let useCase: ListStaffInvitationsUseCase;

	const mockRestaurant = Restaurant.create({
		restaurantName: "Tasty Bites",
		email: "owner@tastybites.com",
		phone: "+1234567890",
		ownerName: "John Owner",
		ownerEmail: "owner@tastybites.com",
		status: "ACTIVE",
	});

	const mockInvitation = StaffInvitation.create({
		id: "inv-123",
		restaurantId: mockRestaurant.id,
		email: "staff@example.com",
		tokenHash: "token-hash-123",
		expiresAt: new Date(Date.now() + 86400000),
	});

	beforeEach(() => {
		staffInvitationRepository = {
			findById: jest.fn(),
			findByTokenHash: jest.fn(),
			findByEmail: jest.fn(),
			findPendingByEmailAndRestaurant: jest.fn(),
			findByRestaurantId: jest.fn(),
			findManyWithFilters: jest.fn(),
			createStaffWithInvitation: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
		};

		restaurantRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			existsByEmail: jest.fn(),
			createRestaurant: jest.fn(),
			create: jest.fn(),
			findUnique: jest.fn(),
			find: jest.fn(),
		};

		useCase = new ListStaffInvitationsUseCase(
			staffInvitationRepository,
			restaurantRepository,
		);
	});

	it("should throw RestaurantNotFoundError if restaurant does not exist", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-id",
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("should throw RestaurantAccountBlockedError when restaurant is blocked", async () => {
		const blockedRestaurant = Restaurant.create({
			restaurantName: "Blocked Bistro",
			email: "blocked@bistro.com",
			phone: "+1234567890",
			ownerName: "Blocked Owner",
			ownerEmail: "blocked@bistro.com",
			status: "ACTIVE",
			isBlocked: true,
		});
		restaurantRepository.findById.mockResolvedValue(blockedRestaurant);

		await expect(
			useCase.execute({
				restaurantId: blockedRestaurant.id,
			}),
		).rejects.toThrow(RestaurantAccountBlockedError);
	});

	it("should throw RestaurantInactiveError when restaurant status is not ACTIVE or APPROVED", async () => {
		const inactiveRestaurant = Restaurant.create({
			restaurantName: "Inactive Bistro",
			email: "inactive@bistro.com",
			phone: "+1234567890",
			ownerName: "Inactive Owner",
			ownerEmail: "inactive@bistro.com",
			status: "INACTIVE",
		});
		restaurantRepository.findById.mockResolvedValue(inactiveRestaurant);

		await expect(
			useCase.execute({
				restaurantId: inactiveRestaurant.id,
			}),
		).rejects.toThrow(RestaurantInactiveError);
	});

	it("should list invitations with default pagination and sorting when options are omitted", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffInvitationRepository.findManyWithFilters.mockResolvedValue({
			invitations: [mockInvitation],
			total: 1,
		});

		const result = await useCase.execute({
			restaurantId: mockRestaurant.id,
		});

		expect(staffInvitationRepository.findManyWithFilters).toHaveBeenCalledWith({
			restaurantId: mockRestaurant.id,
			page: 1,
			limit: 10,
			status: undefined,
			search: undefined,
			sortBy: "createdAt",
			sortOrder: "desc",
		});

		expect(result).toEqual({
			invitations: [
				{
					id: mockInvitation.id,
					restaurantId: mockInvitation.restaurantId,
					email: mockInvitation.email,
					status: mockInvitation.status,
					expiresAt: mockInvitation.expiresAt,
					acceptedAt: mockInvitation.acceptedAt,
					createdAt: mockInvitation.createdAt,
					updatedAt: mockInvitation.updatedAt,
				},
			],
			pagination: {
				page: 1,
				limit: 10,
				total: 1,
				totalPages: 1,
				hasNextPage: false,
				hasPrevPage: false,
			},
		});
	});

	it("should pass filters, custom sort, and pagination to repository", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant);
		staffInvitationRepository.findManyWithFilters.mockResolvedValue({
			invitations: [mockInvitation],
			total: 25,
		});

		const result = await useCase.execute({
			restaurantId: mockRestaurant.id,
			page: 2,
			limit: 10,
			status: "PENDING",
			search: "  staff@  ",
			sortBy: "email",
			sortOrder: "asc",
		});

		expect(staffInvitationRepository.findManyWithFilters).toHaveBeenCalledWith({
			restaurantId: mockRestaurant.id,
			page: 2,
			limit: 10,
			status: "PENDING",
			search: "staff@",
			sortBy: "email",
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
