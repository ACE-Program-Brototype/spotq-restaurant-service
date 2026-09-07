import { prisma } from "@/config/prisma.ts";
import { logger } from "@/infrastructure/observability/logger.ts";

export class SubscriptionExpiryService {
	private intervalId: NodeJS.Timeout | null = null;
	private isRunning = false;

	start(intervalMs = 60 * 60 * 1000): void {
		if (this.intervalId) return;

		this.expirePastDueSubscriptions().catch((err) => {
			logger.error({ err }, "Error running initial subscription expiry check");
		});

		this.intervalId = setInterval(() => {
			this.expirePastDueSubscriptions().catch((err) => {
				logger.error(
					{ err },
					"Error running scheduled subscription expiry check",
				);
			});
		}, intervalMs);

		logger.info({ intervalMs }, "SubscriptionExpiryService started");
	}

	stop(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			logger.info("SubscriptionExpiryService stopped");
		}
	}

	async expirePastDueSubscriptions(now = new Date()): Promise<number> {
		if (this.isRunning) return 0;
		this.isRunning = true;

		try {
			const result = await prisma.restaurant.updateMany({
				where: {
					isSubscriptionActive: true,
					subscriptionEndsAt: {
						lt: now,
					},
				},
				data: {
					isSubscriptionActive: false,
				},
			});

			if (result.count > 0) {
				logger.info(
					{ count: result.count, timestamp: now.toISOString() },
					"Expired past-due restaurant subscriptions (is_subscription_active set to false)",
				);
			}

			return result.count;
		} catch (error) {
			logger.error({ err: error }, "Failed to expire past-due subscriptions");
			throw error;
		} finally {
			this.isRunning = false;
		}
	}
}

export const subscriptionExpiryService = new SubscriptionExpiryService();
