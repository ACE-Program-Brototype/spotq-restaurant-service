import { BrevoClient } from "@getbrevo/brevo";
import { env } from "./env";

export const brevoClient = new BrevoClient({
	apiKey: env.BREVO_API_KEY,
});
