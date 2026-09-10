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

	it("should reject invalid page or limit", () => {
		const result = listRestaurantsQuerySchema.safeParse({
			page: "0",
		});

		expect(result.success).toBe(false);
	});
});
