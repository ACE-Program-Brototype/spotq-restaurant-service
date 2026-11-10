import { describe, expect, it } from "@jest/globals";
import { getPlatformDashboardAnalyticsQuerySchema } from "@/presentation/http/validators/admin/get-platform-dashboard-analytics.validator.ts";

describe("Admin Platform Analytics Validator", () => {
	it("should parse valid period, year, and month", () => {
		const query = {
			period: "MONTH",
			year: "2026",
			month: "11",
			billingCycle: "MONTHLY",
		};
		const result = getPlatformDashboardAnalyticsQuerySchema.safeParse(query);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.period).toBe("MONTH");
			expect(result.data.year).toBe(2026);
			expect(result.data.month).toBe(11);
			expect(result.data.billingCycle).toBe("MONTHLY");
		}
	});

	it("should reject February 31", () => {
		const query = { month: "2", day: "31", year: "2026" };
		const result = getPlatformDashboardAnalyticsQuerySchema.safeParse(query);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toContain("Invalid calendar date");
		}
	});

	it("should reject year before 2000", () => {
		const query = { year: "1999" };
		const result = getPlatformDashboardAnalyticsQuerySchema.safeParse(query);
		expect(result.success).toBe(false);
	});

	it("should reject when from is after to", () => {
		const query = {
			from: "2026-11-10T00:00:00.000Z",
			to: "2026-11-01T00:00:00.000Z",
		};
		const result = getPlatformDashboardAnalyticsQuerySchema.safeParse(query);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toContain(
				"'from' date must be earlier",
			);
		}
	});

	it("should accept valid legacy from and to dates", () => {
		const query = {
			from: "2026-01-01T00:00:00.000Z",
			to: "2026-11-01T00:00:00.000Z",
			fiscalYear: "2026",
		};
		const result = getPlatformDashboardAnalyticsQuerySchema.safeParse(query);
		expect(result.success).toBe(true);
	});
});

