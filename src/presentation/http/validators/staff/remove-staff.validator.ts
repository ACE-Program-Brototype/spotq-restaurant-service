import { z } from "zod";

/**
 * Validates path parameters for staff removal endpoint.
 *
 * Requirements:
 * - restaurantId: must be a valid UUID string
 * - staffId: must be a valid UUID string
 */
export const removeStaffParamsSchema = z.object({
	restaurantId: z.string().uuid({ message: "Invalid restaurant ID format" }),
	staffId: z.string().uuid({ message: "Invalid staff ID format" }),
});

export type RemoveStaffParamsInput = z.infer<typeof removeStaffParamsSchema>;
