import { listRestaurantApplicationsSchema } from "@/presentation/http/validators/admin/list-restaurant-applications.validator.ts";

describe("listRestaurantApplicationsSchema", () => {
	it("should apply default values when query params are empty", () => {
		const result = listRestaurantApplicationsSchema.safeParse({});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.page).toBe(1);
			expect(result.data.limit).toBe(10);
			expect(result.data.sortBy).toBe("createdAt");
			expect(result.data.sortOrder).toBe("desc");
			expect(result.data.status).toBeUndefined();
			expect(result.data.search).toBeUndefined();
			expect(result.data.fromDate).toBeUndefined();
			expect(result.data.toDate).toBeUndefined();
		}
	});

	it("should accept valid status PENDING or REJECTED", () => {
		const pendingResult = listRestaurantApplicationsSchema.safeParse({
			status: "PENDING",
		});
		expect(pendingResult.success).toBe(true);
		if (pendingResult.success) {
			expect(pendingResult.data.status).toBe("PENDING");
		}

		const rejectedResult = listRestaurantApplicationsSchema.safeParse({
			status: "REJECTED",
		});
		expect(rejectedResult.success).toBe(true);
		if (rejectedResult.success) {
			expect(rejectedResult.data.status).toBe("REJECTED");
		}
	});

	it("should reject any status other than PENDING or REJECTED", () => {
		const result = listRestaurantApplicationsSchema.safeParse({
			status: "ACTIVE",
		});

		expect(result.success).toBe(false);
	});

	it("should parse and transform search strings", () => {
		const validSearch = listRestaurantApplicationsSchema.safeParse({
			search: "  Gourmet  ",
		});
		expect(validSearch.success).toBe(true);
		if (validSearch.success) {
			expect(validSearch.data.search).toBe("Gourmet");
		}

		const emptySearch = listRestaurantApplicationsSchema.safeParse({
			search: "   ",
		});
		expect(emptySearch.success).toBe(true);
		if (emptySearch.success) {
			expect(emptySearch.data.search).toBeUndefined();
		}
	});

	it("should parse valid fromDate and toDate filters", () => {
		const result = listRestaurantApplicationsSchema.safeParse({
			fromDate: "2026-03-01",
			toDate: "2026-03-15",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.fromDate).toBeInstanceOf(Date);
			expect(result.data.toDate).toBeInstanceOf(Date);
			expect(result.data.fromDate?.getUTCFullYear()).toBe(2026);
		}
	});

	it("should accept snake_case from_date and to_date filters", () => {
		const result = listRestaurantApplicationsSchema.safeParse({
			from_date: "2026-01-01T00:00:00.000Z",
			to_date: "2026-01-31T23:59:59.999Z",
			sort_by: "created_at",
			sort_order: "asc",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.fromDate).toBeInstanceOf(Date);
			expect(result.data.toDate).toBeInstanceOf(Date);
			expect(result.data.sortBy).toBe("createdAt");
			expect(result.data.sortOrder).toBe("asc");
		}
	});

	it("should fail validation if fromDate is after toDate", () => {
		const result = listRestaurantApplicationsSchema.safeParse({
			fromDate: "2026-03-20",
			toDate: "2026-03-10",
		});

		expect(result.success).toBe(false);
	});

	it("should fail validation for invalid date format", () => {
		const result = listRestaurantApplicationsSchema.safeParse({
			fromDate: "invalid-date",
		});

		expect(result.success).toBe(false);
	});
});
