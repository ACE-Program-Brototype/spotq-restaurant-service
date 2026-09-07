import { InvalidPhoneError } from "@/domain/errors/staff.errors.ts";
import { StaffPhone } from "@/domain/value-objects/phone.vo.ts";

describe("StaffPhone Value Object", () => {
	it("should create a valid StaffPhone and trim whitespace", () => {
		const phone = StaffPhone.create("  +1234567890  ");
		expect(phone.value).toBe("+1234567890");
		expect(phone.toString()).toBe("+1234567890");
	});

	it("should normalize Indian phone numbers with various prefixes to E.164 (+91XXXXXXXXXX)", () => {
		const variations = [
			"9876543210",
			"09876543210",
			"919876543210",
			"+919876543210",
			"+91 9876543210",
			"+91-9876543210",
		];

		for (const variation of variations) {
			const phone = StaffPhone.create(variation);
			expect(phone.value).toBe("+919876543210");
			expect(phone.toString()).toBe("+919876543210");
		}
	});

	it("should throw InvalidPhoneError for invalid phone numbers", () => {
		expect(() => StaffPhone.create("abc")).toThrow(InvalidPhoneError);
		expect(() => StaffPhone.create("123")).toThrow(InvalidPhoneError);
		expect(() => StaffPhone.create("")).toThrow(InvalidPhoneError);
	});

	it("should correctly compare equality between two StaffPhone instances", () => {
		const phone1 = StaffPhone.create("+1234567890");
		const phone2 = StaffPhone.create("+1234567890");
		const phone3 = StaffPhone.create("+9876543210");

		expect(phone1.equals(phone2)).toBe(true);
		expect(phone1.equals(phone3)).toBe(false);
	});
});
