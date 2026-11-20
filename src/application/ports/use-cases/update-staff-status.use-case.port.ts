import type {
	UpdateStaffStatusDTO,
	UpdateStaffStatusResponseDTO,
} from "@/application/dtos/staff/update-staff-status.dto.ts";

/**
 * Inbound port interface for updating staff member status use case.
 */
export interface IUpdateStaffStatusUseCase {
	/**
	 * Execute the status update workflow for a restaurant staff member.
	 *
	 * @param dto - Validated input containing restaurantId, staffId, and requested status
	 * @returns Safe response containing staff ID, updated status, and timestamp
	 */
	execute(dto: UpdateStaffStatusDTO): Promise<UpdateStaffStatusResponseDTO>;
}
