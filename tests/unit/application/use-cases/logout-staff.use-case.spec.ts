import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { LogoutStaffUseCase } from "@/application/use-cases/staff/logout-staff.use-case.ts";
import type { ITokenRevocationRepository } from "@/domain/repositories/token-revocation.repository.interface.ts";

describe("LogoutStaffUseCase", () => {
	let tokenRevocationRepository: jest.Mocked<ITokenRevocationRepository>;
	let useCase: LogoutStaffUseCase;

	beforeEach(() => {
		tokenRevocationRepository = {
			revoke: jest.fn(),
			isRevoked: jest.fn(),
		};

		useCase = new LogoutStaffUseCase(tokenRevocationRepository);
	});

	it("should revoke refreshToken when provided", async () => {
		tokenRevocationRepository.revoke.mockResolvedValue();

		await useCase.execute({
			refreshToken: "mock-refresh-token",
		});

		expect(tokenRevocationRepository.revoke).toHaveBeenCalledWith(
			"mock-refresh-token",
		);
	});

	it("should execute logout without error when no refreshToken is provided", async () => {
		await useCase.execute({});

		expect(tokenRevocationRepository.revoke).not.toHaveBeenCalled();
	});
});
