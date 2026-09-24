import { describe, expect, it } from "@jest/globals";
import { Staff } from "@/domain/entities/staff.entity.ts";
import { InvalidStaffDataError } from "@/domain/errors/staff.errors.ts";

describe("Staff Entity", () => {
	const validProps = {
		fullname: "John Doe",
		email: "john.doe@example.com",
		phone: "+1234567890",
		passwordHash: "hashedPassword123",
	};

	describe("create", () => {
		it("should create a staff entity with valid properties", () => {
			const staff = Staff.create(validProps);

			expect(staff.id).toBeDefined();
			expect(staff.fullname).toBe("John Doe");
			expect(staff.email).toBe("john.doe@example.com");
			expect(staff.phone).toBe("+1234567890");
			expect(staff.passwordHash).toBe("hashedPassword123");
			expect(staff.avatarUrl).toBeNull();
			expect(staff.avatarUpdatedAt).toBeNull();
			expect(staff.createdAt).toBeInstanceOf(Date);
			expect(staff.updatedAt).toBeInstanceOf(Date);
		});

		it("should throw InvalidStaffDataError when fullname is too short", () => {
			expect(() => {
				Staff.create({
					...validProps,
					fullname: "J",
				});
			}).toThrow(InvalidStaffDataError);
		});

		it("should throw InvalidStaffDataError when passwordHash is missing", () => {
			expect(() => {
				Staff.create({
					...validProps,
					passwordHash: "",
				});
			}).toThrow(InvalidStaffDataError);
		});

		it("should trim fullname whitespace", () => {
			const staff = Staff.create({
				...validProps,
				fullname: "  John Doe  ",
			});
			expect(staff.fullname).toBe("John Doe");
		});

		it("should set avatarUrl and avatarUpdatedAt when avatar is provided", () => {
			const staff = Staff.create({
				...validProps,
				avatarUrl: "https://example.com/avatar.jpg",
			});
			expect(staff.avatarUrl).toBe("https://example.com/avatar.jpg");
			expect(staff.avatarUpdatedAt).toBeInstanceOf(Date);
		});
	});

	describe("reconstitute", () => {
		it("should reconstitute a staff entity with exact props", () => {
			const now = new Date();
			const staff = Staff.reconstitute({
				id: "staff-123",
				fullname: "Jane Doe",
				email: "jane@example.com",
				phone: "+1987654321",
				passwordHash: "hash456",
				avatarUrl: "https://example.com/jane.jpg",
				avatarUpdatedAt: now,
				createdAt: now,
				updatedAt: now,
			});

			expect(staff.id).toBe("staff-123");
			expect(staff.fullname).toBe("Jane Doe");
			expect(staff.email).toBe("jane@example.com");
			expect(staff.phone).toBe("+1987654321");
			expect(staff.avatarUrl).toBe("https://example.com/jane.jpg");
			expect(staff.createdAt).toEqual(now);
			expect(staff.updatedAt).toEqual(now);
		});
	});

	describe("updateProfile", () => {
		it("should update fullname and phone", () => {
			const staff = Staff.create(validProps);
			staff.updateProfile("Johnny Doe", "+1555555555");

			expect(staff.fullname).toBe("Johnny Doe");
			expect(staff.phone).toBe("+1555555555");
		});

		it("should throw InvalidStaffDataError when updating with an invalid fullname", () => {
			const staff = Staff.create(validProps);
			expect(() => staff.updateProfile(" ")).toThrow(InvalidStaffDataError);
		});

		it("should update avatar when avatar string is passed", () => {
			const staff = Staff.create(validProps);
			staff.updateProfile(undefined, undefined, "https://example.com/new.png");

			expect(staff.avatarUrl).toBe("https://example.com/new.png");
			expect(staff.avatarUpdatedAt).toBeInstanceOf(Date);
		});

		it("should remove avatar when avatar null is passed", () => {
			const staff = Staff.create({
				...validProps,
				avatarUrl: "https://example.com/old.png",
			});
			staff.updateProfile(undefined, undefined, null);

			expect(staff.avatarUrl).toBeNull();
			expect(staff.avatarUpdatedAt).toBeNull();
		});
	});

	describe("changePassword", () => {
		it("should change password hash", () => {
			const staff = Staff.create(validProps);
			staff.changePassword("newHashedPassword789");
			expect(staff.passwordHash).toBe("newHashedPassword789");
		});

		it("should throw InvalidStaffDataError when new passwordHash is empty", () => {
			const staff = Staff.create(validProps);
			expect(() => staff.changePassword("")).toThrow(InvalidStaffDataError);
		});
	});
});
