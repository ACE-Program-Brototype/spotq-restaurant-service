import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

/**
 * Validates path parameters for staff removal endpoint.
 *
 * Requirements:
 * - restaurantId: must be a valid UUID string
 * - staffId: must be a valid UUID string
 */
export const removeStaffParamsSchema = z.object({
	restaurantId: z
		.string()
		.uuid({ message: messages.INVALID_RESTAURANT_ID_FORMAT }),
	staffId: z.string().uuid({ message: messages.INVALID_STAFF_ID_FORMAT }),
});

export type RemoveStaffParamsInput = z.infer<typeof removeStaffParamsSchema>;
