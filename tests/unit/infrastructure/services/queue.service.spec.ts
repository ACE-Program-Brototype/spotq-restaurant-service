import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	jest,
} from "@jest/globals";
import { QueueService } from "@/infrastructure/services/queue.service.ts";

describe("QueueService", () => {
	let queueService: QueueService;
	const originalFetch = global.fetch;

	beforeEach(() => {
		jest.clearAllMocks();
		queueService = new QueueService(
			"http://queue-service:3004",
			"restaurant-service",
			"queue-service",
		);
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	it("returns default queue status without calling fetch when userId is not provided", async () => {
		global.fetch = jest.fn() as typeof fetch;

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
		});

		expect(global.fetch).not.toHaveBeenCalled();
		expect(result).toEqual({
			isOpen: true,
			activeWaiters: 0,
			estimatedWaitMinutes: 0,
			membership: null,
		});
	});

	it("returns active queue membership with isCurrentRestaurantQueue: true when restaurantId matches", async () => {
		const mockResponse = {
			success: true,
			data: {
				queueEntryId: "entry-1",
				restaurantId: "rest-1",
			},
		};

		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		} as Response) as typeof fetch;

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isOpen: true,
			activeWaiters: 0,
			estimatedWaitMinutes: 0,
			membership: {
				hasActiveQueue: true,
				queueEntryId: "entry-1",
				isCurrentRestaurantQueue: true,
			},
		});
	});

	it("returns active queue membership with isCurrentRestaurantQueue: false when restaurantId differs", async () => {
		const mockResponse = {
			success: true,
			data: {
				queueEntryId: "entry-99",
				restaurantId: "different-restaurant",
			},
		};

		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		} as Response) as typeof fetch;

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isOpen: true,
			activeWaiters: 0,
			estimatedWaitMinutes: 0,
			membership: {
				hasActiveQueue: true,
				queueEntryId: "entry-99",
				isCurrentRestaurantQueue: false,
			},
		});
	});

	it("returns hasActiveQueue: false and isCurrentRestaurantQueue: false when data is null", async () => {
		const mockResponse = {
			success: true,
			data: null,
		};

		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		} as Response) as typeof fetch;

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isOpen: true,
			activeWaiters: 0,
			estimatedWaitMinutes: 0,
			membership: {
				hasActiveQueue: false,
				queueEntryId: null,
				isCurrentRestaurantQueue: false,
			},
		});
	});

	it("returns unavailable status when queue-service returns HTTP error", async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: false,
			status: 500,
		} as Response) as typeof fetch;

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isOpen: true,
			activeWaiters: 0,
			estimatedWaitMinutes: 0,
			membership: null,
		});
	});

	it("returns unavailable status when queue-service payload success is false or malformed", async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ success: false, data: null }),
		} as Response) as typeof fetch;

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isOpen: true,
			activeWaiters: 0,
			estimatedWaitMinutes: 0,
			membership: null,
		});
	});

	it("returns unavailable status when queue-service response omits data property", async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ success: true }),
		} as Response) as typeof fetch;

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isOpen: true,
			activeWaiters: 0,
			estimatedWaitMinutes: 0,
			membership: null,
		});
	});

	it("returns unavailable status when queue-service data has invalid schema", async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				success: true,
				data: { restaurantId: 123, queueEntryId: true },
			}),
		} as Response) as typeof fetch;

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isOpen: true,
			activeWaiters: 0,
			estimatedWaitMinutes: 0,
			membership: null,
		});
	});

	it("gracefully catches network timeout or abort without throwing", async () => {
		global.fetch = jest
			.fn()
			.mockRejectedValue(new Error("Network Error")) as typeof fetch;

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isOpen: true,
			activeWaiters: 0,
			estimatedWaitMinutes: 0,
			membership: null,
		});
	});

	it("returns unavailable status when private key is missing", async () => {
		const serviceWithoutKey = new QueueService(
			"http://queue-service:3004",
			"restaurant-service",
			"queue-service",
			"",
		);

		const result = await serviceWithoutKey.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isOpen: true,
			activeWaiters: 0,
			estimatedWaitMinutes: 0,
			membership: null,
		});
	});
});
