import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import {
	InvalidOnboardingStatusError,
	InvalidRestaurantDataError,
	RestaurantAlreadyProcessedError,
} from "@/domain/errors/restaurant.errors.ts";

describe("Restaurant Entity", () => {
	const validProps = {
		restaurantName: "SpotQ Gourmet",
		email: "contact@spotqgourmet.com",
		phone: "+1234567890",
		ownerName: "Jane Owner",
		ownerEmail: "jane@spotqgourmet.com",
		status: "PENDING",
		onboardingStatus: "PENDING",
	};

	it("should create a Restaurant entity successfully using factory create()", () => {
		const restaurant = Restaurant.create(validProps);

		expect(restaurant.id).toBeDefined();
		expect(restaurant.restaurantName).toBe("SpotQ Gourmet");
		expect(restaurant.email).toBe("contact@spotqgourmet.com");
		expect(restaurant.phone).toBe("+1234567890");
		expect(restaurant.ownerName).toBe("Jane Owner");
		expect(restaurant.ownerEmail).toBe("jane@spotqgourmet.com");
		expect(restaurant.status).toBe("PENDING");
		expect(restaurant.onboardingStatus).toBe("PENDING");
		expect(restaurant.isBlocked).toBe(false);
		expect(restaurant.blockReason).toBeNull();
		expect(restaurant.createdAt).toBeInstanceOf(Date);
	});

	it("should reconstitute an existing Restaurant without modification", () => {
		const pastDate = new Date("2026-01-01T00:00:00Z");
		const reconstituted = Restaurant.reconstitute({
			id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			restaurantName: "Diner Prime",
			email: "info@dinerprime.com",
			phone: "+9876543210",
			ownerName: "John Doe",
			ownerEmail: "john@dinerprime.com",
			status: "ACTIVE",
			onboardingStatus: "COMPLETED",
			emailVerifiedAt: pastDate,
			isBlocked: false,
			blockReason: null,
			createdAt: pastDate,
			updatedAt: pastDate,
		});

		expect(reconstituted.id).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
		expect(reconstituted.status).toBe("ACTIVE");
		expect(reconstituted.onboardingStatus).toBe("COMPLETED");
		expect(reconstituted.emailVerifiedAt).toEqual(pastDate);
	});

	it("should throw InvalidRestaurantDataError when required fields are missing or invalid", () => {
		expect(() =>
			Restaurant.create({
				...validProps,
				restaurantName: "A",
			}),
		).toThrow(InvalidRestaurantDataError);

		expect(() =>
			Restaurant.create({
				...validProps,
				ownerName: "",
			}),
		).toThrow(InvalidRestaurantDataError);
	});

	it("should support domain mutations (block, unblock, verifyEmail, completeOnboarding, updateStatus)", () => {
		const restaurant = Restaurant.create(validProps);

		restaurant.block("Policy violation");
		expect(restaurant.isBlocked).toBe(true);
		expect(restaurant.status).toBe("SUSPENDED");
		expect(restaurant.blockReason).toBe("Policy violation");

		restaurant.unblock();
		expect(restaurant.isBlocked).toBe(false);
		expect(restaurant.status).toBe("ACTIVE");
		expect(restaurant.blockReason).toBeNull();

		restaurant.verifyEmail();
		expect(restaurant.emailVerifiedAt).toBeInstanceOf(Date);

		restaurant.completeOnboarding();
		expect(restaurant.onboardingStatus).toBe("COMPLETED");

		restaurant.updateStatus("ACTIVE");
		expect(restaurant.status).toBe("ACTIVE");
	});

	describe("approve()", () => {
		it("should successfully approve restaurant when status is PENDING and onboarding is COMPLETED", () => {
			const restaurant = Restaurant.create({
				...validProps,
				onboardingStatus: "COMPLETED",
			});

			restaurant.approve();
			expect(restaurant.status).toBe("APPROVED");
			expect(restaurant.rejectionReason).toBeNull();
		});

		it("should throw InvalidOnboardingStatusError when onboarding is not COMPLETED", () => {
			const restaurant = Restaurant.create({
				...validProps,
				onboardingStatus: "PENDING",
			});

			expect(() => restaurant.approve()).toThrow(
				InvalidOnboardingStatusError,
			);
		});

		it("should throw RestaurantAlreadyProcessedError when status is not PENDING", () => {
			const restaurant = Restaurant.reconstitute({
				id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				restaurantName: "Diner Prime",
				email: "info@dinerprime.com",
				phone: "+9876543210",
				ownerName: "John Doe",
				ownerEmail: "john@dinerprime.com",
				status: "APPROVED",
				onboardingStatus: "COMPLETED",
				emailVerifiedAt: new Date(),
				isBlocked: false,
				blockReason: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			expect(() => restaurant.approve()).toThrow(
				RestaurantAlreadyProcessedError,
			);
		});
	});

	describe("reject()", () => {
		it("should successfully reject restaurant with reason when status is PENDING and onboarding is COMPLETED", () => {
			const restaurant = Restaurant.create({
				...validProps,
				onboardingStatus: "COMPLETED",
			});

			restaurant.reject("Invalid FSSAI document");
			expect(restaurant.status).toBe("REJECTED");
			expect(restaurant.rejectionReason).toBe("Invalid FSSAI document");
			expect(restaurant.isBlocked).toBe(false);
			expect(restaurant.blockReason).toBeNull();
		});

		it("should throw InvalidOnboardingStatusError when onboarding is not COMPLETED", () => {
			const restaurant = Restaurant.create({
				...validProps,
				onboardingStatus: "PENDING",
			});

			expect(() => restaurant.reject("Invalid document")).toThrow(
				InvalidOnboardingStatusError,
			);
		});

		it("should throw RestaurantAlreadyProcessedError when status is already REJECTED", () => {
			const restaurant = Restaurant.reconstitute({
				id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				restaurantName: "Diner Prime",
				email: "info@dinerprime.com",
				phone: "+9876543210",
				ownerName: "John Doe",
				ownerEmail: "john@dinerprime.com",
				status: "REJECTED",
				onboardingStatus: "COMPLETED",
				emailVerifiedAt: new Date(),
				isBlocked: false,
				blockReason: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			expect(() => restaurant.reject("Invalid document")).toThrow(
				RestaurantAlreadyProcessedError,
			);
		});

		it("should throw InvalidRestaurantDataError when rejection reason is empty or whitespace", () => {
			const restaurant = Restaurant.create({
				...validProps,
				onboardingStatus: "COMPLETED",
			});

			expect(() => restaurant.reject("   ")).toThrow(
				InvalidRestaurantDataError,
			);
		});
	});

	it("should support subscription domain mutations (activateSubscription, expireSubscription)", () => {
		const restaurant = Restaurant.create(validProps);
		const endsAt = new Date("2026-10-01T00:00:00Z");

		restaurant.activateSubscription("PRO_ANNUAL", endsAt);
		expect(restaurant.isSubscriptionActive).toBe(true);
		expect(restaurant.subscriptionPlanCode).toBe("PRO_ANNUAL");
		expect(restaurant.subscriptionEndsAt).toEqual(endsAt);
		expect(restaurant.status).toBe("ACTIVE");

		restaurant.expireSubscription();
		expect(restaurant.isSubscriptionActive).toBe(false);
	});
});
