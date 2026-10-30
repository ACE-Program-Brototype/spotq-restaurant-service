import crypto from "node:crypto";
import axios from "axios";
import { QueueService } from "@infrastructure/external/queue.service";
import {
	beforeEach,
	describe,
	expect,
	it,
	jest,
} from "@jest/globals";

describe("QueueService", () => {
	let queueService: QueueService;
	let axiosGetSpy: ReturnType<typeof jest.spyOn>;
	const { privateKey } = crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		privateKeyEncoding: { type: "pkcs8", format: "pem" },
		publicKeyEncoding: { type: "spki", format: "pem" },
	});

	beforeEach(() => {
		jest.clearAllMocks();
		axiosGetSpy = jest.spyOn(axios, "get");
		queueService = new QueueService(
			"http://queue-service:3004",
			"restaurant-service",
			"queue-service",
			privateKey,
		);
	});

	it("returns default queue status without calling fetch when userId is not provided", async () => {
		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
		});

		expect(axiosGetSpy).not.toHaveBeenCalled();
		expect(result).toEqual({
			isGuestUser: true,
			hasJoinedAnyQueue: null,
			hasJoinedThisRestaurantQueue: null,
			isQueueStatusAvailable: false,
		});
	});

	it("reports queue membership when queue-service returns an active entry for this restaurant", async () => {
		const mockResponse = {
			success: true,
			data: {
				queueEntryId: "entry-1",
				restaurantId: "rest-1",
			},
		};

		axiosGetSpy.mockResolvedValue({ data: mockResponse } as never);

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isGuestUser: false,
			hasJoinedAnyQueue: true,
			hasJoinedThisRestaurantQueue: true,
			isQueueStatusAvailable: true,
		});
	});

	it("reports queue membership for another restaurant without marking this restaurant joined", async () => {
		const mockResponse = {
			success: true,
			data: {
				queueEntryId: "entry-99",
				restaurantId: "different-restaurant",
			},
		};

		axiosGetSpy.mockResolvedValue({ data: mockResponse } as never);

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isGuestUser: false,
			hasJoinedAnyQueue: true,
			hasJoinedThisRestaurantQueue: false,
			isQueueStatusAvailable: true,
		});
	});

	it("returns available empty membership when data is null", async () => {
		const mockResponse = {
			success: true,
			data: null,
		};

		axiosGetSpy.mockResolvedValue({ data: mockResponse } as never);

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isGuestUser: false,
			hasJoinedAnyQueue: false,
			hasJoinedThisRestaurantQueue: false,
			isQueueStatusAvailable: true,
		});
	});

	it("returns unavailable status when queue-service returns HTTP error", async () => {
		axiosGetSpy.mockRejectedValue(new Error("HTTP 500"));

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isGuestUser: false,
			hasJoinedAnyQueue: null,
			hasJoinedThisRestaurantQueue: null,
			isQueueStatusAvailable: false,
		});
	});

	it("returns unavailable status when queue-service payload success is false or malformed", async () => {
		axiosGetSpy.mockResolvedValue({
			data: { success: false, data: null },
		} as never);

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isGuestUser: false,
			hasJoinedAnyQueue: null,
			hasJoinedThisRestaurantQueue: null,
			isQueueStatusAvailable: false,
		});
	});

	it("returns unavailable status when queue-service response omits data property", async () => {
		axiosGetSpy.mockResolvedValue({ data: { success: true } } as never);

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isGuestUser: false,
			hasJoinedAnyQueue: null,
			hasJoinedThisRestaurantQueue: null,
			isQueueStatusAvailable: false,
		});
	});

	it("returns unavailable status when queue-service data has invalid schema", async () => {
		axiosGetSpy.mockResolvedValue({
			data: {
				success: true,
				data: { restaurantId: 123, queueEntryId: true },
			},
		} as never);

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isGuestUser: false,
			hasJoinedAnyQueue: null,
			hasJoinedThisRestaurantQueue: null,
			isQueueStatusAvailable: false,
		});
	});

	it("gracefully catches network timeout or abort without throwing", async () => {
		axiosGetSpy.mockRejectedValue(new Error("Network Error"));

		const result = await queueService.getQueueStatus({
			restaurantId: "rest-1",
			userId: "user-1",
		});

		expect(result).toEqual({
			isGuestUser: false,
			hasJoinedAnyQueue: null,
			hasJoinedThisRestaurantQueue: null,
			isQueueStatusAvailable: false,
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
			isGuestUser: false,
			hasJoinedAnyQueue: null,
			hasJoinedThisRestaurantQueue: null,
			isQueueStatusAvailable: false,
		});
	});
});
