import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type {
	ITokenService,
	StaffTokenPayload,
} from "@/application/ports/services/token-service.port.ts";
import { SelectRestaurantUseCase } from "@/application/use-cases/staff/select-restaurant.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	InvalidTempTokenError,
	RestaurantAccountBlockedError,
	RestaurantInactiveError,
	RestaurantNotFoundError,
	StaffForbiddenError,
	StaffInactiveError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

describe("SelectRestaurantUseCase", () => {
	let useCase: SelectRestaurantUseCase;
	let mockStaffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let mockRestaurantRepository: jest.Mocked<IRestaurantRepository>;
	let mockTokenService: jest.Mocked<ITokenService>;

	const sampleStaffId = "staff-uuid-1234";
	const sampleRestaurantId = "rest-uuid-5678";
	const sampleEmail = "staff@restaurant.com";
	const sampleSelectToken = "valid.select.token";

	const defaultTokenPayload = {
		sub: sampleStaffId,
		email: sampleEmail,
		type: "restaurant_selection",
		purpose: "restaurant-selection",
	};

	const createMockRestaurant = (
		overrides?: Partial<Parameters<typeof Restaurant.reconstitute>[0]>,
	): Restaurant => {
		return Restaurant.reconstitute({
			id: sampleRestaurantId,
			restaurantName: "Test Bistro",
			email: "bistro@example.com",
			phone: "+1234567890",
			ownerName: "Owner Bob",
			ownerEmail: "owner@bistro.com",
			status: "ACTIVE",
			onboardingStatus: "COMPLETED",
			isBlocked: false,
			emailVerifiedAt: new Date("2026-01-01"),
			isSubscriptionActive: true,
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
			...overrides,
		});
	};

	const createMockMembership = (
		overrides?: Partial<Parameters<typeof RestaurantStaff.reconstitute>[0]>,
	): RestaurantStaff => {
		return RestaurantStaff.reconstitute({
			id: "membership-uuid-9999",
			staffId: sampleStaffId,
			restaurantId: sampleRestaurantId,
			role: "STAFF",
			status: "ACTIVE",
			fullname: "Chef John",
			email: sampleEmail,
			phone: "+1234567890",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
			...overrides,
		});
	};

	beforeEach(() => {
		mockStaffRepository = {
			save: jest.fn(),
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByRestaurantId: jest.fn(),
			findActiveByRestaurantId: jest.fn(),
			findByStaffIdAndRestaurantId: jest.fn(),
			findActiveByStaffId: jest.fn(),
			countByRestaurantId: jest.fn(),
			delete: jest.fn(),
			findWithFilters: jest.fn(),
			findStaffIdsByPhoneOrEmail: jest.fn(),
			findActiveStaffMembershipsByEmail: jest.fn(),
			updateStaffInfo: jest.fn(),
			updateStatus: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantStaffRepository>;

		mockRestaurantRepository = {
			save: jest.fn(),
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByPhone: jest.fn(),
			findByFssai: jest.fn(),
			findByGst: jest.fn(),
			findPendingApplications: jest.fn(),
			countPendingApplications: jest.fn(),
			findApprovedRestaurants: jest.fn(),
			countApprovedRestaurants: jest.fn(),
			delete: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockTokenService = {
			generateAccessToken: jest.fn(),
			generateRefreshToken: jest.fn(),
			verifyAccessToken: jest.fn(),
			verifyRefreshToken: jest.fn(),
			generateTempToken: jest.fn(),
			verifyTempToken: jest.fn(),
		} as unknown as jest.Mocked<ITokenService>;

		mockTokenService.verifyTempToken.mockReturnValue(
			defaultTokenPayload as unknown as ReturnType<
				ITokenService["verifyTempToken"]
			>,
		);

		useCase = new SelectRestaurantUseCase(
			mockStaffRepository,
			mockTokenService,
			mockRestaurantRepository,
		);
	});

	it("should successfully issue access and refresh tokens when valid token and restaurantId are provided", async () => {
		mockTokenService.verifyTempToken.mockReturnValue(
			defaultTokenPayload as unknown as ReturnType<
				ITokenService["verifyTempToken"]
			>,
		);

		const membership = createMockMembership();
		mockStaffRepository.findByStaffIdAndRestaurantId.mockResolvedValue(membership);

		const restaurant = createMockRestaurant();
		mockRestaurantRepository.findById.mockResolvedValue(restaurant);

		mockTokenService.generateAccessToken.mockReturnValue("mock-access-token");
		mockTokenService.generateRefreshToken.mockReturnValue("mock-refresh-token");

		const result = await useCase.execute({
			selectToken: sampleSelectToken,
			restaurantId: sampleRestaurantId,
		});

		expect(result.accessToken).toBe("mock-access-token");
		expect(result.refreshToken).toBe("mock-refresh-token");
		expect(result.staff.id).toBe(sampleStaffId);
		expect(result.staff.restaurantId).toBe(sampleRestaurantId);

		expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith(
			expect.objectContaining<StaffTokenPayload>({
				sub: sampleStaffId,
				restaurantId: sampleRestaurantId,
				email: sampleEmail,
				role: "STAFF",
			}),
		);
	});

	it("should throw InvalidTempTokenError when token payload is missing or invalid", async () => {
		mockTokenService.verifyTempToken.mockReturnValue(
			null as unknown as ReturnType<ITokenService["verifyTempToken"]>,
		);

		await expect(
			useCase.execute({
				selectToken: "invalid-token",
				restaurantId: sampleRestaurantId,
			}),
		).rejects.toThrow(InvalidTempTokenError);
	});

	it("should throw InvalidTempTokenError when token purpose is not restaurant-selection", async () => {
		mockTokenService.verifyTempToken.mockReturnValue({
			sub: sampleStaffId,
			email: sampleEmail,
			purpose: "email-verification" as unknown as "restaurant-selection",
		} as unknown as ReturnType<ITokenService["verifyTempToken"]>);

		await expect(
			useCase.execute({
				selectToken: "wrong-type-token",
				restaurantId: sampleRestaurantId,
			}),
		).rejects.toThrow(InvalidTempTokenError);
	});

	it("should throw StaffForbiddenError when staff does not have membership in the selected restaurant", async () => {
		mockTokenService.verifyTempToken.mockReturnValue(
			defaultTokenPayload as unknown as ReturnType<
				ITokenService["verifyTempToken"]
			>,
		);

		mockStaffRepository.findByStaffIdAndRestaurantId.mockResolvedValue(null);

		await expect(
			useCase.execute({
				selectToken: sampleSelectToken,
				restaurantId: sampleRestaurantId,
			}),
		).rejects.toThrow(StaffForbiddenError);
	});

	it("should throw StaffInactiveError when staff membership is inactive", async () => {
		mockTokenService.verifyTempToken.mockReturnValue(
			defaultTokenPayload as unknown as ReturnType<
				ITokenService["verifyTempToken"]
			>,
		);

		const inactiveMembership = createMockMembership({
			status: "INACTIVE",
		});
		mockStaffRepository.findByStaffIdAndRestaurantId.mockResolvedValue(
			inactiveMembership,
		);

		await expect(
			useCase.execute({
				selectToken: sampleSelectToken,
				restaurantId: sampleRestaurantId,
			}),
		).rejects.toThrow(StaffInactiveError);
	});

	it("should throw StaffSuspendedError when staff membership is suspended", async () => {
		mockTokenService.verifyTempToken.mockReturnValue(
			defaultTokenPayload as unknown as ReturnType<
				ITokenService["verifyTempToken"]
			>,
		);

		const suspendedMembership = createMockMembership({
			status: "SUSPENDED",
		});
		mockStaffRepository.findByStaffIdAndRestaurantId.mockResolvedValue(
			suspendedMembership,
		);

		await expect(
			useCase.execute({
				selectToken: sampleSelectToken,
				restaurantId: sampleRestaurantId,
			}),
		).rejects.toThrow(StaffSuspendedError);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		mockTokenService.verifyTempToken.mockReturnValue(
			defaultTokenPayload as unknown as ReturnType<
				ITokenService["verifyTempToken"]
			>,
		);

		const membership = createMockMembership();
		mockStaffRepository.findByStaffIdAndRestaurantId.mockResolvedValue(membership);
		mockRestaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				selectToken: sampleSelectToken,
				restaurantId: sampleRestaurantId,
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("should throw RestaurantAccountBlockedError when restaurant is blocked", async () => {
		mockTokenService.verifyTempToken.mockReturnValue(
			defaultTokenPayload as unknown as ReturnType<
				ITokenService["verifyTempToken"]
			>,
		);

		const membership = createMockMembership();
		mockStaffRepository.findByStaffIdAndRestaurantId.mockResolvedValue(membership);

		const blockedRestaurant = createMockRestaurant({ isBlocked: true });
		mockRestaurantRepository.findById.mockResolvedValue(blockedRestaurant);

		await expect(
			useCase.execute({
				selectToken: sampleSelectToken,
				restaurantId: sampleRestaurantId,
			}),
		).rejects.toThrow(RestaurantAccountBlockedError);
	});

	it("should throw RestaurantInactiveError when onboarding status is not COMPLETED", async () => {
		mockTokenService.verifyTempToken.mockReturnValue(
			defaultTokenPayload as unknown as ReturnType<
				ITokenService["verifyTempToken"]
			>,
		);

		const membership = createMockMembership();
		mockStaffRepository.findByStaffIdAndRestaurantId.mockResolvedValue(membership);

		const incompleteRestaurant = createMockRestaurant({
			onboardingStatus: "PENDING",
		});
		mockRestaurantRepository.findById.mockResolvedValue(incompleteRestaurant);

		await expect(
			useCase.execute({
				selectToken: sampleSelectToken,
				restaurantId: sampleRestaurantId,
			}),
		).rejects.toThrow(RestaurantInactiveError);
	});

	it("should throw RestaurantInactiveError when subscription is inactive", async () => {
		mockTokenService.verifyTempToken.mockReturnValue(
			defaultTokenPayload as unknown as ReturnType<
				ITokenService["verifyTempToken"]
			>,
		);

		const membership = createMockMembership();
		mockStaffRepository.findByStaffIdAndRestaurantId.mockResolvedValue(membership);

		const expiredRestaurant = createMockRestaurant({
			isSubscriptionActive: false,
		});
		mockRestaurantRepository.findById.mockResolvedValue(expiredRestaurant);

		await expect(
			useCase.execute({
				selectToken: sampleSelectToken,
				restaurantId: sampleRestaurantId,
			}),
		).rejects.toThrow(RestaurantInactiveError);
	});
});
