import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import { InvalidStaffDataError } from "@/domain/errors/staff.errors.ts";

describe("RestaurantStaff Entity", () => {
	const validProps = {
		restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		fullname: "Alice Staff",
		email: "alice@spotq.com",
		phone: "+1234567890",
		passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456",
		role: "MANAGER",
		status: "ACTIVE",
	};

	it("should create a RestaurantStaff entity successfully using factory create()", () => {
		const staff = RestaurantStaff.create(validProps);

		expect(staff.id).toBeDefined();
		expect(staff.restaurantId).toBe(validProps.restaurantId);
		expect(staff.fullname).toBe("Alice Staff");
		expect(staff.email).toBe("alice@spotq.com");
		expect(staff.phone).toBe("+1234567890");
		expect(staff.role).toBe("MANAGER");
		expect(staff.status).toBe("ACTIVE");
		expect(staff.isActive()).toBe(true);
		expect(staff.createdAt).toBeInstanceOf(Date);
	});

	it("should reconstitute an existing RestaurantStaff without modification", () => {
		const pastDate = new Date("2026-01-01T00:00:00Z");
		const reconstituted = RestaurantStaff.reconstitute({
			id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			restaurantId: validProps.restaurantId,
			fullname: "Bob Chef",
			email: "bob@spotq.com",
			phone: "+1234567891",
			avatarUrl: "https://avatar.com/img.jpg",
			passwordHash: "hash123",
			role: "CHEF",
			status: "ACTIVE",
			createdAt: pastDate,
			updatedAt: pastDate,
		});

		expect(reconstituted.id).toBe("b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01");
		expect(reconstituted.fullname).toBe("Bob Chef");
		expect(reconstituted.createdAt).toEqual(pastDate);
	});

	it("should throw InvalidStaffDataError when restaurantId or fullname is invalid", () => {
		expect(() =>
			RestaurantStaff.create({
				...validProps,
				restaurantId: "",
			}),
		).toThrow(InvalidStaffDataError);

		expect(() =>
			RestaurantStaff.create({
				...validProps,
				fullname: "A",
			}),
		).toThrow(InvalidStaffDataError);
	});

	it("should support domain mutations (updateProfile, changePassword, activate, deactivate, suspend)", () => {
		const staff = RestaurantStaff.create(validProps);

		staff.updateProfile("Alice Wonderland", "+9876543210", "https://img.com");
		expect(staff.fullname).toBe("Alice Wonderland");
		expect(staff.phone).toBe("+9876543210");
		expect(staff.avatarUrl).toBe("https://img.com");

		staff.changePassword("new-hash-12345");
		expect(staff.passwordHash).toBe("new-hash-12345");

		staff.deactivate();
		expect(staff.status).toBe("INACTIVE");
		expect(staff.isActive()).toBe(false);

		staff.suspend();
		expect(staff.status).toBe("SUSPENDED");
		expect(staff.isSuspended()).toBe(true);

		staff.activate();
		expect(staff.status).toBe("ACTIVE");
		expect(staff.isActive()).toBe(true);
	});
});
