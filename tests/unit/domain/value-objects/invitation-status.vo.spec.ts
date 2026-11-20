import { describe, expect, it } from "@jest/globals";
import {
	InvalidInvitationStatusError,
	InvitationStatusVO,
} from "@/domain/value-objects/invitation-status.vo.ts";

describe("InvitationStatusVO Value Object", () => {
	it("should create valid invitation statuses and evaluate predicates", () => {
		const pending = InvitationStatusVO.create("pending");
		const accepted = InvitationStatusVO.accepted();
		const expired = InvitationStatusVO.expired();
		const revoked = InvitationStatusVO.revoked();

		expect(pending.value).toBe("PENDING");
		expect(pending.isPending()).toBe(true);
		expect(pending.isAccepted()).toBe(false);

		expect(accepted.value).toBe("ACCEPTED");
		expect(accepted.isAccepted()).toBe(true);
		expect(accepted.isPending()).toBe(false);

		expect(expired.value).toBe("EXPIRED");
		expect(expired.isExpired()).toBe(true);

		expect(revoked.value).toBe("REVOKED");
		expect(revoked.isRevoked()).toBe(true);
	});

	it("should support equality comparison", () => {
		const pending1 = InvitationStatusVO.pending();
		const pending2 = InvitationStatusVO.create("PENDING");
		const accepted = InvitationStatusVO.accepted();

		expect(pending1.equals(pending2)).toBe(true);
		expect(pending1.equals(accepted)).toBe(false);
	});

	it("should throw InvalidInvitationStatusError for invalid statuses", () => {
		expect(() => InvitationStatusVO.create("INVALID_STATUS")).toThrow(
			InvalidInvitationStatusError,
		);
		expect(() => InvitationStatusVO.create("")).toThrow(
			InvalidInvitationStatusError,
		);
	});
});
