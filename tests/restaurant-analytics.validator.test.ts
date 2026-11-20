import { describe, expect, it } from "@jest/globals";
import {
	getRestaurantAnalyticsDashboardParamsSchema,
	getRestaurantAnalyticsDashboardQuerySchema,
} from "@/presentation/http/validators/restaurant/get-restaurant-analytics-dashboard.validator.ts";

describe("Restaurant Analytics Validators", () => {
	describe("getRestaurantAnalyticsDashboardParamsSchema", () => {
		it("should pass when restaurantId is a valid UUID", () => {
			const valid = { restaurantId: "123e4567-e89b-12d3-a456-426614174000" };
			const result =
				getRestaurantAnalyticsDashboardParamsSchema.safeParse(valid);
			expect(result.success).toBe(true);
		});

		it("should fail when restaurantId is not a UUID", () => {
			const invalid = { restaurantId: "not-a-uuid" };
			const result =
				getRestaurantAnalyticsDashboardParamsSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});
	});

	describe("getRestaurantAnalyticsDashboardQuerySchema", () => {
		it("should parse valid query parameters with defaults", () => {
			const query = {
				interval: "MONTH",
				year: "2026",
				month: "11",
				page: "2",
				limit: "20",
			};
			const result =
				getRestaurantAnalyticsDashboardQuerySchema.safeParse(query);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.interval).toBe("MONTH");
				expect(result.data.year).toBe(2026);
				expect(result.data.month).toBe(11);
				expect(result.data.page).toBe(2);
				expect(result.data.limit).toBe(20);
			}
		});

		it("should reject February 31 (invalid calendar date)", () => {
			const query = { month: "2", day: "31", year: "2026" };
			const result =
				getRestaurantAnalyticsDashboardQuerySchema.safeParse(query);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toContain(
					"Invalid calendar date",
				);
			}
		});

		it("should reject April 31 (month with 30 days)", () => {
			const query = { month: "4", day: "31", year: "2026" };
			const result =
				getRestaurantAnalyticsDashboardQuerySchema.safeParse(query);
			expect(result.success).toBe(false);
		});

		it("should reject February 29 in non-leap year 2023", () => {
			const query = { month: "2", day: "29", year: "2023" };
			const result =
				getRestaurantAnalyticsDashboardQuerySchema.safeParse(query);
			expect(result.success).toBe(false);
		});

		it("should accept February 29 in leap year 2024", () => {
			const query = { month: "2", day: "29", year: "2024" };
			const result =
				getRestaurantAnalyticsDashboardQuerySchema.safeParse(query);
			expect(result.success).toBe(true);
		});

		it("should reject year before 2000", () => {
			const query = { year: "1999" };
			const result =
				getRestaurantAnalyticsDashboardQuerySchema.safeParse(query);
			expect(result.success).toBe(false);
		});

		it("should reject limit exceeding 100", () => {
			const query = { limit: "101" };
			const result =
				getRestaurantAnalyticsDashboardQuerySchema.safeParse(query);
			expect(result.success).toBe(false);
		});

		it("should reject page less than 1", () => {
			const query = { page: "0" };
			const result =
				getRestaurantAnalyticsDashboardQuerySchema.safeParse(query);
			expect(result.success).toBe(false);
		});
	});
});
