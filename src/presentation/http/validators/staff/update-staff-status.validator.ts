import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

/**
 * Validates path parameters for staff status update.
 * Both restaurantId and staffId must be valid UUIDs.
 */
export const updateStaffStatusParamsSchema = z.object({
	restaurantId: z
		.string()
		.uuid({ message: messages.INVALID_RESTAURANT_ID_FORMAT }),
	staffId: z.string().uuid({ message: messages.INVALID_STAFF_ID_FORMAT }),
});

export type UpdateStaffStatusParamsInput = z.infer<
	typeof updateStaffStatusParamsSchema
>;

/**
 * Validates request body for updating staff status.
 * Only "ACTIVE" and "INACTIVE" are accepted. Extra fields are rejected.
 */
export const updateStaffStatusSchema = z
	.object({
		status: z.enum(["ACTIVE", "INACTIVE"], {
			error: messages.INVALID_STAFF_STATUS,
		}),
	})
	.strict();

export type UpdateStaffStatusBodyInput = z.infer<
	typeof updateStaffStatusSchema
>;
