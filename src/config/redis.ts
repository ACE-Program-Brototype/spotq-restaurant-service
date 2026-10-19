import { Redis } from "ioredis";
import { env } from "@/config/env.ts";

const redis = new Redis('redis://localhost:', {
	maxRetriesPerRequest: null,
});

export default redis;
