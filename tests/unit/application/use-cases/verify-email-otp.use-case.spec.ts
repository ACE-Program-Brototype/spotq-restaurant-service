import { InvalidOtpError } from "@/application/errors/invalid-otp.error";
import { RestaurantAccountBlockedError } from "@/application/errors/restaurant-account-blocked.error";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IAuthTokenService } from "@/application/ports/services/auth-token.service.port";
import type { IOtpService } from "@/application/ports/services/otp.service.port";
import type { IOtpHashService } from "@/application/ports/services/otp-hash.service.port";
import type { IOtpStore } from "@/application/ports/services/otp-store.port";
import { VerifyRestaurantEmailOtpUseCase } from "@/application/use-cases/verify-email-otp.use-case";
import { Restaurant } from "@/domain/entities/restaurant.entity";

describe("VerifyRestaurantEmailOtpUseCase", () => {
	let useCase: VerifyRestaurantEmailOtpUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockOtpStore: jest.Mocked<IOtpStore>;
	let mockOtpService: jest.Mocked<IOtpService>;
	let mockAuthTokenService: jest.Mocked<IAuthTokenService>;
	let mockOtpHashService: jest.Mocked<IOtpHashService>;

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
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockOtpStore = {
			get: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
			exists: jest.fn(),
			increment: jest.fn(),
		};

		mockOtpService = {
			checkSendRateLimit: jest.fn(),
			checkResendRateLimit: jest.fn(),
			incrementAttempt: jest.fn(),
			resetAttempts: jest.fn(),
		};

		mockAuthTokenService = {
			generateAccessToken: jest.fn(),
			generateRefreshToken: jest.fn(),
			verifyAccessToken: jest.fn(),
			verifyRefreshToken: jest.fn(),
			generateTokenPair: jest.fn().mockReturnValue({
				accessToken: "mock-access-token",
				refreshToken: "mock-refresh-token",
			}),
		};

		mockOtpHashService = {
			hash: jest.fn(),
			compare: jest.fn(),
		};

		useCase = new VerifyRestaurantEmailOtpUseCase(
			mockRestaurantRepo,
			mockOtpStore,
			mockOtpService,
			mockAuthTokenService,
			mockOtpHashService,
		);
	});

	it("throws InvalidOtpError if OTP is not found in store", async () => {
		mockOtpStore.get.mockResolvedValue(null);

		await expect(
			useCase.execute({ email: "test@restaurant.com", otp: "123456" }),
		).rejects.toThrow(InvalidOtpError);
	});

	it("creates restaurant, returns tokens and restaurantId for new valid OTP verification", async () => {
		mockOtpStore.get.mockResolvedValue("hashed-otp");
		mockOtpHashService.compare.mockResolvedValue(true);
		mockRestaurantRepo.findByEmail.mockResolvedValue(null);
		mockRestaurantRepo.createRestaurant.mockResolvedValue(
			Restaurant.reconstitute({
				id: "res-123",
				restaurantName: "Pending Registration",
				email: "new@restaurant.com",
				phone: "0000000000",
				ownerName: "Pending Owner",
				ownerEmail: "new@restaurant.com",
				status: "PENDING",
				onboardingStatus: "PENDING",
				emailVerifiedAt: new Date(),
				isBlocked: false,
				blockReason: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}),
		);

		const result = await useCase.execute({
			email: "new@restaurant.com",
			otp: "123456",
		});

		expect(mockRestaurantRepo.createRestaurant).toHaveBeenCalledWith(
			expect.objectContaining({
				email: "new@restaurant.com",
				ownerEmail: "new@restaurant.com",
			}),
		);
		expect(result).toEqual({
			nextStep: "ONBOARDING",
			restaurantId: "res-123",
			accessToken: "mock-access-token",
			refreshToken: "mock-refresh-token",
		});
		expect(result).not.toHaveProperty("verificationToken");
	});

	it("returns SUBSCRIPTION nextStep for existing fully onboarded and approved restaurant", async () => {
		mockOtpStore.get.mockResolvedValue("hashed-otp");
		mockOtpHashService.compare.mockResolvedValue(true);
		mockRestaurantRepo.findByEmail.mockResolvedValue(
			Restaurant.reconstitute({
				id: "res-456",
				restaurantName: "Good Food",
				email: "existing@restaurant.com",
				phone: "1234567890",
				ownerName: "Owner",
				ownerEmail: "existing@restaurant.com",
				status: "ACTIVE",
				onboardingStatus: "COMPLETED",
				emailVerifiedAt: new Date(),
				isBlocked: false,
				blockReason: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}),
		);

		const result = await useCase.execute({
			email: "existing@restaurant.com",
			otp: "123456",
		});

		expect(result.nextStep).toBe("SUBSCRIPTION");
		expect(result.restaurantId).toBe("res-456");
	});

	it("returns VERIFICATION_STATUS nextStep for completed onboarding with pending status", async () => {
		mockOtpStore.get.mockResolvedValue("hashed-otp");
		mockOtpHashService.compare.mockResolvedValue(true);
		mockRestaurantRepo.findByEmail.mockResolvedValue(
			Restaurant.reconstitute({
				id: "res-456",
				restaurantName: "Good Food",
				email: "pending@restaurant.com",
				phone: "1234567890",
				ownerName: "Owner",
				ownerEmail: "pending@restaurant.com",
				status: "PENDING",
				onboardingStatus: "COMPLETED",
				emailVerifiedAt: new Date(),
				isBlocked: false,
				blockReason: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}),
		);

		const result = await useCase.execute({
			email: "pending@restaurant.com",
			otp: "123456",
		});

		expect(result.nextStep).toBe("VERIFICATION_STATUS");
		expect(result.restaurantId).toBe("res-456");
	});

	it("throws RestaurantAccountBlockedError for blocked restaurant", async () => {
		mockOtpStore.get.mockResolvedValue("hashed-otp");
		mockOtpHashService.compare.mockResolvedValue(true);
		mockRestaurantRepo.findByEmail.mockResolvedValue(
			Restaurant.reconstitute({
				id: "res-789",
				restaurantName: "Blocked",
				email: "blocked@restaurant.com",
				phone: "123",
				ownerName: "Owner",
				ownerEmail: "blocked@restaurant.com",
				status: "SUSPENDED",
				onboardingStatus: "PENDING",
				emailVerifiedAt: new Date(),
				isBlocked: true,
				blockReason: "Violation",
				createdAt: new Date(),
				updatedAt: new Date(),
			}),
		);

		await expect(
			useCase.execute({ email: "blocked@restaurant.com", otp: "123456" }),
		).rejects.toThrow(RestaurantAccountBlockedError);
	});
});
