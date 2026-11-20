import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const deleteAddonParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
		addonId: z.uuid({ message: messages.INVALID_ADDON_ID }),
	})
	.strict();

export type DeleteAddonParams = z.infer<typeof deleteAddonParamsSchema>;
