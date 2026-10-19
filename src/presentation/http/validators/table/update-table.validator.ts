import { TABLE_SHAPE_VALUES } from "@domain/constants/table.constants";
import { messages } from "@shared/constants/message.constants";
import { z } from "zod";

export const updateTableParamsSchema = z.object({
	restaurantId: z.string().trim().min(1, messages.RESTAURANT_ID_REQUIRED),
	tableId: z.string().trim().min(1, messages.TABLE_ID_REQUIRED),
});

export const updateTableBodySchema = z
	.object({
		sectionId: z.string().trim().uuid().min(1).optional(),
		tableCode: z.string().trim().min(1).max(50).optional(),
		capacity: z.number().int().min(1).optional(),
		type: z.enum(TABLE_SHAPE_VALUES).optional(),
	})
	.strict()
	.refine((body) => Object.values(body).some((value) => value !== undefined), {
		message: "At least one field must be provided",
	});

export type UpdateTableParamsType = z.infer<typeof updateTableParamsSchema>;
export type UpdateTableBodyType = z.infer<typeof updateTableBodySchema>;
