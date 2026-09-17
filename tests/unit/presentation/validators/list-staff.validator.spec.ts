import { describe, expect, it } from "@jest/globals";
import { listStaffSchema } from "@/presentation/http/validators/staff/list-staff.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("listStaffSchema", () => {
	it("should apply default values when query params are empty", () => {
		const result = listStaffSchema.safeParse({});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({
				page: 1,
				limit: 20,
				sortBy: "createdAt",
				sortOrder: "DESC",
			});
		}
	});

	it("should parse valid pagination, status, search, and sort parameters", () => {
		const result = listStaffSchema.safeParse({
			page: "2",
			limit: "15",
			status: "ACTIVE",
			search: "  ravi  ",
			sortBy: "createdAt",
			sortOrder: "asc",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({
				page: 2,
				limit: 15,
				status: "ACTIVE",
				search: "ravi",
				sortBy: "createdAt",
				sortOrder: "ASC",
			});
		}
	});

	it("should reject invalid status with custom error message", () => {
		const result = listStaffSchema.safeParse({
			status: "INVALID_STATUS",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				messages.INVALID_STAFF_STATUS,
			);
		}
	});

	it("should reject invalid sortBy field with custom error message", () => {
		const result = listStaffSchema.safeParse({
			sortBy: "password",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(messages.INVALID_SORT_FIELD);
		}
	});

	it("should reject invalid sortOrder with custom error message", () => {
		const result = listStaffSchema.safeParse({
			sortOrder: "RANDOM",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(messages.INVALID_SORT_ORDER);
		}
	});
});
