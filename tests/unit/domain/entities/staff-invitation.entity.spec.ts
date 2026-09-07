import { describe, expect, it } from "@jest/globals";
import { StaffInvitation } from "@/domain/entities/staff-invitation.entity.ts";
import { InvalidStaffDataError } from "@/domain/errors/staff.errors.ts";

describe("StaffInvitation Entity", () => {
	const validProps = {
		restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		email: "staff@example.com",
		tokenHash: "abc123hash",
		expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
	};

	it("should create a valid StaffInvitation with default PENDING status", () => {
		const invitation = StaffInvitation.create(validProps);

		expect(invitation.id).toBeDefined();
		expect(invitation.restaurantId).toBe(validProps.restaurantId);
		expect(invitation.email).toBe("staff@example.com");
		expect(invitation.tokenHash).toBe("abc123hash");
		expect(invitation.status).toBe("PENDING");
		expect(invitation.isPending()).toBe(true);
		expect(invitation.isExpired()).toBe(false);
		expect(invitation.acceptedAt).toBeNull();
	});

	it("should reconstitute a StaffInvitation properly", () => {
		const pastDate = new Date("2026-01-01T00:00:00Z");
		const invitation = StaffInvitation.reconstitute({
			id: "inv-123",
			restaurantId: validProps.restaurantId,
			email: "reconstituted@example.com",
			tokenHash: "token-hash-123",
			status: "ACCEPTED",
			expiresAt: pastDate,
			acceptedAt: pastDate,
			createdAt: pastDate,
			updatedAt: pastDate,
		});

		expect(invitation.id).toBe("inv-123");
		expect(invitation.status).toBe("ACCEPTED");
		expect(invitation.isPending()).toBe(false);
	});

	it("should throw InvalidStaffDataError when restaurantId is missing", () => {
		expect(() =>
			StaffInvitation.create({
				...validProps,
				restaurantId: "",
			}),
		).toThrow(InvalidStaffDataError);
	});

	it("should throw InvalidStaffDataError when tokenHash is missing", () => {
		expect(() =>
			StaffInvitation.create({
				...validProps,
				tokenHash: "",
			}),
		).toThrow(InvalidStaffDataError);
	});

	it("should transition status to ACCEPTED on accept()", () => {
		const invitation = StaffInvitation.create(validProps);
		invitation.accept();

		expect(invitation.status).toBe("ACCEPTED");
		expect(invitation.acceptedAt).toBeInstanceOf(Date);
		expect(invitation.isPending()).toBe(false);
	});

	it("should transition status to REVOKED on revoke()", () => {
		const invitation = StaffInvitation.create(validProps);
		invitation.revoke();

		expect(invitation.status).toBe("REVOKED");
		expect(invitation.isPending()).toBe(false);
	});

	it("should renew invitation with new tokenHash, expiry, and PENDING status", () => {
		const invitation = StaffInvitation.create(validProps);
		const newExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000);

		invitation.renew("new-token-hash-456", newExpiry);

		expect(invitation.tokenHash).toBe("new-token-hash-456");
		expect(invitation.expiresAt).toEqual(newExpiry);
		expect(invitation.status).toBe("PENDING");
	});

	it("should throw InvalidStaffDataError when trying to renew an already ACCEPTED invitation", () => {
		const invitation = StaffInvitation.create(validProps);
		invitation.accept();

		expect(() =>
			invitation.renew(
				"new-token-hash-456",
				new Date(Date.now() + 72 * 60 * 60 * 1000),
			),
		).toThrow(InvalidStaffDataError);
	});
});
