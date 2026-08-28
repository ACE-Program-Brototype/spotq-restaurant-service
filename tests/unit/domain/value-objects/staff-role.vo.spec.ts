import { InvalidStaffRoleError } from "@/domain/errors/staff.errors.ts";
import { StaffRoleVO } from "@/domain/value-objects/staff-role.vo.ts";

describe("StaffRoleVO Value Object", () => {
	it("should create valid staff roles and normalize to uppercase", () => {
		const role1 = StaffRoleVO.create("owner");
		const role2 = StaffRoleVO.create("MANAGER");
		const role3 = StaffRoleVO.create("chef");
		const role4 = StaffRoleVO.create("WAITER");
		const role5 = StaffRoleVO.create("cashier");
		const role6 = StaffRoleVO.create("staff");

		expect(role1.value).toBe("OWNER");
		expect(role2.value).toBe("MANAGER");
		expect(role3.value).toBe("CHEF");
		expect(role4.value).toBe("WAITER");
		expect(role5.value).toBe("CASHIER");
		expect(role6.value).toBe("STAFF");
	});

	it("should throw InvalidStaffRoleError for unrecognized roles", () => {
		expect(() => StaffRoleVO.create("SUPERADMIN")).toThrow(
			InvalidStaffRoleError,
		);
		expect(() => StaffRoleVO.create("")).toThrow(InvalidStaffRoleError);
	});
});
