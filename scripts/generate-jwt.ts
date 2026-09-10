import jwt from "jsonwebtoken";
import { env } from "@/config/env.ts";

const payload = {
	sub: "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
	restaurantId: "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
	email: "owner@spotq.com",
	role: "RESTAURANT_ADMIN",
};

const token = jwt.sign(payload, env.JWT_ACCESS_PRIVATE_KEY, {
	algorithm: env.JWT_ALGORITHM as jwt.Algorithm,
	keyid: env.JWT_ACCESS_TOKEN_KEY_ID,
	expiresIn: "24h",
});

console.log("\n================ GENERATED JWT ================\n");
console.log(token);
console.log("\n===============================================\n");
