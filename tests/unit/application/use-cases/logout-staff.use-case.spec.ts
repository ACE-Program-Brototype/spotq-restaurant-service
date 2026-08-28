import { describe, expect, it } from "@jest/globals";
import { LogoutStaffUseCase } from "@/application/use-cases/staff/logout-staff.use-case.ts";

describe("LogoutStaffUseCase", () => {
	it("should execute logout successfully", async () => {
		const useCase = new LogoutStaffUseCase();
		await expect(
			useCase.execute({ refreshToken: "valid-refresh-token" }),
		).resolves.toBeUndefined();
	});

	it("should execute logout without error even if refreshToken is undefined", async () => {
		const useCase = new LogoutStaffUseCase();
		await expect(useCase.execute({})).resolves.toBeUndefined();
	});
});
