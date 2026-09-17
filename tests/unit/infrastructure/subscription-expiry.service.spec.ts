import { prisma } from "@/config/prisma";
import { SubscriptionExpiryService } from "@/infrastructure/services/subscription-expiry.service";

jest.mock("@/config/prisma", () => ({
	prisma: {
		restaurant: {
			updateMany: jest.fn(),
		},
	},
}));

jest.mock("@/infrastructure/observability/logger", () => ({
	logger: {
		info: jest.fn(),
		error: jest.fn(),
	},
}));

describe("SubscriptionExpiryService", () => {
	let service: SubscriptionExpiryService;

	beforeEach(() => {
		jest.clearAllMocks();
		service = new SubscriptionExpiryService();
	});

	afterEach(() => {
		service.stop();
	});

	it("updates isSubscriptionActive to false for past-due subscriptions", async () => {
		const fixedNow = new Date("2026-09-07T12:00:00Z");
		(prisma.restaurant.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

		const count = await service.expirePastDueSubscriptions(fixedNow);

		expect(prisma.restaurant.updateMany).toHaveBeenCalledWith({
			where: {
				isSubscriptionActive: true,
				subscriptionEndsAt: {
					lt: fixedNow,
				},
			},
			data: {
				isSubscriptionActive: false,
			},
		});
		expect(count).toBe(3);
	});

	it("returns 0 when no restaurants have expired subscriptions", async () => {
		(prisma.restaurant.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

		const count = await service.expirePastDueSubscriptions();

		expect(count).toBe(0);
	});

	it("handles database errors gracefully and rethrows", async () => {
		(prisma.restaurant.updateMany as jest.Mock).mockRejectedValue(
			new Error("DB connection error"),
		);

		await expect(service.expirePastDueSubscriptions()).rejects.toThrow(
			"DB connection error",
		);
	});

	it("starts and stops periodic check timer cleanly", () => {
		jest.useFakeTimers();
		const spy = jest
			.spyOn(service, "expirePastDueSubscriptions")
			.mockResolvedValue(0);

		service.start(1000);
		expect(spy).toHaveBeenCalledTimes(1);

		jest.advanceTimersByTime(1000);
		expect(spy).toHaveBeenCalledTimes(2);

		service.stop();
		jest.advanceTimersByTime(2000);
		expect(spy).toHaveBeenCalledTimes(2);

		jest.useRealTimers();
	});
});
