import { Redis } from "ioredis";
import { env } from "@/config/env.ts";

const redis = new Redis(env.REDIS_URL);

export default redis;
