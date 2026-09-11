import { describe, expect, it } from "@jest/globals";
import { listRestaurantsQuerySchema } from "@/presentation/http/validators/admin/list-restaurants.validator.ts";

describe("listRestaurantsQuerySchema", () => {
	it("should apply default pagination and sorting when empty query is passed", () => {
		const result = listRestaurantsQuerySchema.safeParse({});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.page).toBe(1);
			expect(result.data.limit).toBe(10);
			expect(result.data.sortBy).toBe("createdAt");
			expect(result.data.sortOrder).toBe("desc");
		}
	});

	it("should parse valid filter and search parameters", () => {
		const rawQuery = {
			page: "2",
			limit: "25",
			search: "burger",
			status: "APPROVED" as const,
			plan: "PRO",
			is_subscription_active: "true",
			sort_by: "restaurantName",
			sort_order: "asc",
		};

		const result = listRestaurantsQuerySchema.safeParse(rawQuery);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.page).toBe(2);
			expect(result.data.limit).toBe(25);
			expect(result.data.search).toBe("burger");
			expect(result.data.status).toBe("APPROVED");
			expect(result.data.plan).toBe("PRO");
			expect(result.data.isSubscriptionActive).toBe(true);
			expect(result.data.sortBy).toBe("restaurantName");
			expect(result.data.sortOrder).toBe("asc");
		}
	});

	it("should parse camelCase parameters properly", () => {
		const rawQuery = {
			isSubscriptionActive: "false",
			sortBy: "ownerName",
			sortOrder: "desc",
		};

		const result = listRestaurantsQuerySchema.safeParse(rawQuery);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.isSubscriptionActive).toBe(false);
			expect(result.data.sortBy).toBe("ownerName");
			expect(result.data.sortOrder).toBe("desc");
		}
	});

	it("should parse snake_case sort_by parameters and map them to Prisma fields", () => {
		const rawQuery1 = {
			sort_by: "restaurant_name",
			sort_order: "asc",
		};
		const result1 = listRestaurantsQuerySchema.safeParse(rawQuery1);
		expect(result1.success).toBe(true);
		if (result1.success) {
			expect(result1.data.sortBy).toBe("restaurantName");
			expect(result1.data.sortOrder).toBe("asc");
		}

		const rawQuery2 = {
			sort_by: "plan",
			sort_order: "desc",
		};
		const result2 = listRestaurantsQuerySchema.safeParse(rawQuery2);
		expect(result2.success).toBe(true);
		if (result2.success) {
			expect(result2.data.sortBy).toBe("subscriptionPlanCode");
			expect(result2.data.sortOrder).toBe("desc");
		}

		const rawQuery3 = {
			sort_by: "created_at",
		};
		const result3 = listRestaurantsQuerySchema.safeParse(rawQuery3);
		expect(result3.success).toBe(true);
		if (result3.success) {
			expect(result3.data.sortBy).toBe("createdAt");
		}
	});

	it("should accept valid date range when created_from is before or equal to created_to", () => {
		const validRange = {
			created_from: "2026-01-01T00:00:00.000Z",
			created_to: "2026-01-31T23:59:59.999Z",
		};
		const result = listRestaurantsQuerySchema.safeParse(validRange);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.createdFrom).toEqual(
				new Date("2026-01-01T00:00:00.000Z"),
			);
			expect(result.data.createdTo).toEqual(
				new Date("2026-01-31T23:59:59.999Z"),
			);
		}

		const sameDate = {
			createdFrom: "2026-01-01T00:00:00.000Z",
			createdTo: "2026-01-01T00:00:00.000Z",
		};
		const sameDateResult = listRestaurantsQuerySchema.safeParse(sameDate);
		expect(sameDateResult.success).toBe(true);
	});

	it("should reject when created_from is later than created_to (inverted date range)", () => {
		const invertedRange = {
			created_from: "2026-02-01T00:00:00.000Z",
			created_to: "2026-01-01T00:00:00.000Z",
		};
		const result = listRestaurantsQuerySchema.safeParse(invertedRange);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				"created_from must not be later than created_to",
			);
			expect(result.error.issues[0].path).toContain("created_from");
		}
	});

	it("should reject invalid is_subscription_active or isSubscriptionActive values", () => {
		const result1 = listRestaurantsQuerySchema.safeParse({
			is_subscription_active: "invalid",
		});
		expect(result1.success).toBe(false);

		const result2 = listRestaurantsQuerySchema.safeParse({
			isSubscriptionActive: "123",
		});
		expect(result2.success).toBe(false);

		const result3 = listRestaurantsQuerySchema.safeParse({
			is_subscription_active: "not_a_boolean",
		});
		expect(result3.success).toBe(false);
	});

	it("should reject invalid page or limit", () => {
		const result = listRestaurantsQuerySchema.safeParse({
			page: "0",
		});

		expect(result.success).toBe(false);
	});
});
