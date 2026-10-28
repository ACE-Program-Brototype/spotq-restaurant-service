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

	it("returns active queue membership when queue-service responds with active queue", async () => {
		const mockResponse = {
			success: true,
			data: {
				hasActiveQueue: true,
				queueEntry: {
					queueEntryId: "entry-1",
					restaurantId: "rest-1",
					userId: "user-1",
					queueNumber: "Q-12",
					partySize: 2,
					status: "WAITING",
					position: 4,
					estimatedWaitMinutes: 20,
					joinedAt: "2026-10-28T10:00:00.000Z",
				},
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
			activeWaiters: 4,
			estimatedWaitMinutes: 20,
			membership: {
				hasActiveQueue: true,
				queueEntryId: "entry-1",
				queueNumber: "Q-12",
				partySize: 2,
				status: "WAITING",
				position: 4,
				estimatedWaitMinutes: 20,
				joinedAt: "2026-10-28T10:00:00.000Z",
			},
		});
	});

	it("returns fallback status when queue-service returns HTTP error", async () => {
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
});
