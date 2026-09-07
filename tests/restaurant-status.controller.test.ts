import { getRestaurantStatusUseCase } from "@/application/use-cases/get-restaurant-status.use-case.ts";
import { restaurantStatusController } from "@/presentation/http/controllers/restaurant-status.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("RestaurantStatusController", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return 401 UNAUTHORIZED when no restaurant id is passed in header or query", async () => {
		const req = {
			headers: {},
			query: {},
		} as never;

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });

		const res = {
			status: statusMock,
			json: jsonMock,
		} as never;

		await restaurantStatusController.getStatus(req, res);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: messages.UNAUTHORIZED_RESTAURANT,
				code: "UNAUTHORIZED",
			}),
		);
	});

	it("should return 404 NOT_FOUND when restaurant is not found in database", async () => {
		jest
			.spyOn(getRestaurantStatusUseCase, "execute")
			.mockResolvedValueOnce(null);

		const req = {
			headers: { "x-restaurant-id": "rest-non-existent" },
			query: {},
		} as never;

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });

		const res = {
			status: statusMock,
			json: jsonMock,
		} as never;

		await restaurantStatusController.getStatus(req, res);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: messages.RESTAURANT_NOT_FOUND,
				code: "RESTAURANT_NOT_FOUND",
			}),
		);
	});

	it("should return 200 OK with restaurant status data when found", async () => {
		const mockStatus = {
			restaurantId: "rest-123",
			restaurantName: "Grand Bistro",
			verificationStatus: "APPROVED",
			isSubscriptionActive: false,
			subscriptionPlanCode: null,
			subscriptionEndsAt: null,
			navigationTarget: "/restaurant/subscription",
		};

		jest
			.spyOn(getRestaurantStatusUseCase, "execute")
			.mockResolvedValueOnce(mockStatus);

		const req = {
			headers: { "x-restaurant-id": "rest-123" },
			query: {},
		} as never;

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });

		const res = {
			status: statusMock,
			json: jsonMock,
		} as never;

		await restaurantStatusController.getStatus(req, res);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				message: messages.RESTAURANT_STATUS_FETCHED,
				data: mockStatus,
			}),
		);
	});
});
