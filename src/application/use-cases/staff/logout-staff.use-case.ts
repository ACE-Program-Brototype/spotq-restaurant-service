import { TYPES } from "@di/types.ts";
import { inject, injectable } from "inversify";
import type {
	ILogoutStaffUseCase,
	LogoutStaffDTO,
} from "@/application/ports/use-cases/logout-staff.use-case.port.ts";
import type { ITokenRevocationRepository } from "@/domain/repositories/token-revocation.repository.interface.ts";

@injectable()
export class LogoutStaffUseCase implements ILogoutStaffUseCase {
	constructor(
		@inject(TYPES.TokenRevocationRepository)
		private readonly tokenRevocationRepository: ITokenRevocationRepository,
	) {}

	public async execute(dto: LogoutStaffDTO): Promise<void> {
		if (dto.refreshToken) {
			await this.tokenRevocationRepository.revoke(dto.refreshToken);
		}
	}
}
