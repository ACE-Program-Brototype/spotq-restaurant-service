import { describe, expect, it } from "@jest/globals";
import { listStaffInvitationsSchema } from "@/presentation/http/validators/staff/list-invitations.validator.ts";

describe("listStaffInvitationsSchema", () => {
	it("should apply default values when query params are empty", () => {
		const result = listStaffInvitationsSchema.safeParse({});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({
				page: 1,
				limit: 10,
				sortBy: "createdAt",
				sortOrder: "desc",
			});
		}
	});

	it("should coerce string query params to numbers and sanitize fields", () => {
		const result = listStaffInvitationsSchema.safeParse({
			page: "3",
			limit: "20",
			status: "PENDING",
			search: "  john@example.com  ",
			sortBy: "email",
			sortOrder: "asc",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({
				page: 3,
				limit: 20,
				status: "PENDING",
				search: "john@example.com",
				sortBy: "email",
				sortOrder: "asc",
			});
		}
	});

	it("should reject invalid page numbers (less than 1)", () => {
		const result = listStaffInvitationsSchema.safeParse({
			page: "0",
		});

		expect(result.success).toBe(false);
	});

	it("should reject invalid limit (greater than 100)", () => {
		const result = listStaffInvitationsSchema.safeParse({
			limit: "101",
		});

		expect(result.success).toBe(false);
	});

	it("should reject invalid status", () => {
		const result = listStaffInvitationsSchema.safeParse({
			status: "INVALID_STATUS",
		});

		expect(result.success).toBe(false);
	});

	it("should reject invalid sortBy field", () => {
		const result = listStaffInvitationsSchema.safeParse({
			sortBy: "invalidField",
		});

		expect(result.success).toBe(false);
	});
});
