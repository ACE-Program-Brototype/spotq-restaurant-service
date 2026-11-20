import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const getStaffDetailParamsSchema = z.object({
	restaurantId: z.string().uuid({ message: messages.INVALID_RESTAURANT_ID }),
	staffId: z.string().uuid({ message: messages.INVALID_STAFF_ID }),
});

export type GetStaffDetailParams = z.infer<typeof getStaffDetailParamsSchema>;
