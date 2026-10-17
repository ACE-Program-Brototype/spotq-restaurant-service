import { TABLE_STATUS } from "@domain/constants/table.constants";
import { messages } from "@shared/constants/message.constants";
import z from "zod";

export const updateTableStatusParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
		tableId: z.string().trim().min(1, messages.TABLE_ID_REQUIRED),
	})
	.strict();

export const updateTableStatusBodySchema = z
	.object({
		status: z.enum([TABLE_STATUS.AVAILABLE, TABLE_STATUS.MAINTENANCE], {
			message: messages.INVALID_TABLE_STATUS,
		}),
	})
	.strict();

export type UpdateTableStatusParams = z.infer<
	typeof updateTableStatusParamsSchema
>;
export type UpdateTableStatusBody = z.infer<typeof updateTableStatusBodySchema>;
