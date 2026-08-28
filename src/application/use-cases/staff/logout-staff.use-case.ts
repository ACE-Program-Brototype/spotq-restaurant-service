import { injectable } from "inversify";
import type {
	ILogoutStaffUseCase,
	LogoutStaffDTO,
} from "@/application/ports/use-cases/logout-staff.use-case.port.ts";

@injectable()
export class LogoutStaffUseCase implements ILogoutStaffUseCase {
	public async execute(_dto: LogoutStaffDTO): Promise<void> {
		// Handles logout business logic (e.g. token blacklisting/cleanup if applicable)
	}
}
