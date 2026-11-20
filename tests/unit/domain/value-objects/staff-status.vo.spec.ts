import { InvalidStaffStatusError } from "@/domain/errors/staff.errors.ts";
import { StaffStatusVO } from "@/domain/value-objects/staff-status.vo.ts";

describe("StaffStatusVO Value Object", () => {
	it("should create valid staff statuses and evaluate status checks", () => {
		const active = StaffStatusVO.create("active");
		const inactive = StaffStatusVO.create("INACTIVE");
		const suspended = StaffStatusVO.create("suspended");
		const invited = StaffStatusVO.create("INVITED");
		const removed = StaffStatusVO.create("REMOVED");
		const removedHelper = StaffStatusVO.removed();

		expect(active.value).toBe("ACTIVE");
		expect(active.isActive()).toBe(true);
		expect(active.isSuspended()).toBe(false);
		expect(active.isRemoved()).toBe(false);

		expect(inactive.value).toBe("INACTIVE");
		expect(inactive.isActive()).toBe(false);

		expect(suspended.value).toBe("SUSPENDED");
		expect(suspended.isSuspended()).toBe(true);

		expect(invited.value).toBe("INVITED");

		expect(removed.value).toBe("REMOVED");
		expect(removed.isRemoved()).toBe(true);
		expect(removedHelper.value).toBe("REMOVED");
		expect(removedHelper.isRemoved()).toBe(true);
	});

	it("should throw InvalidStaffStatusError for invalid statuses", () => {
		expect(() => StaffStatusVO.create("BANNED")).toThrow(
			InvalidStaffStatusError,
		);
		expect(() => StaffStatusVO.create("")).toThrow(InvalidStaffStatusError);
	});
});
