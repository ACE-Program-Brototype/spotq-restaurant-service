import { InvalidEmailError } from "@/domain/errors/staff.errors.ts";
import { StaffEmail } from "@/domain/value-objects/email.vo.ts";

describe("StaffEmail Value Object", () => {
	it("should create a valid StaffEmail and normalize it to lowercase", () => {
		const email = StaffEmail.create("  User@SpotQ.COM  ");
		expect(email.value).toBe("user@spotq.com");
		expect(email.toString()).toBe("user@spotq.com");
	});

	it("should throw InvalidEmailError for invalid email formats", () => {
		expect(() => StaffEmail.create("invalid-email")).toThrow(InvalidEmailError);
		expect(() => StaffEmail.create("@missinguser.com")).toThrow(
			InvalidEmailError,
		);
		expect(() => StaffEmail.create("user@")).toThrow(InvalidEmailError);
		expect(() => StaffEmail.create("")).toThrow(InvalidEmailError);
	});

	it("should correctly compare equality between two StaffEmail instances", () => {
		const email1 = StaffEmail.create("staff@spotq.com");
		const email2 = StaffEmail.create("STAFF@SPOTQ.COM");
		const email3 = StaffEmail.create("other@spotq.com");

		expect(email1.equals(email2)).toBe(true);
		expect(email1.equals(email3)).toBe(false);
	});
});
