import { InvalidStaffRoleError } from "@/domain/errors/staff.errors.ts";
import { StaffRoleVO } from "@/domain/value-objects/staff-role.vo.ts";

describe("StaffRoleVO Value Object", () => {
	it("should create valid staff role and normalize to uppercase", () => {
		const role1 = StaffRoleVO.create("staff");
		const role2 = StaffRoleVO.create("STAFF");

		expect(role1.value).toBe("STAFF");
		expect(role2.value).toBe("STAFF");
	});

	it("should throw InvalidStaffRoleError for unrecognized roles", () => {
		expect(() => StaffRoleVO.create("MANAGER")).toThrow(
			InvalidStaffRoleError,
		);
		expect(() => StaffRoleVO.create("SUPERADMIN")).toThrow(
			InvalidStaffRoleError,
		);
		expect(() => StaffRoleVO.create("")).toThrow(InvalidStaffRoleError);
	});
});
