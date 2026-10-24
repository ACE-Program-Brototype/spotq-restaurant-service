import jwt from "jsonwebtoken";
import { env } from "@/config/env.ts";

const payload = {
	sub: "911588f8-9ae1-439f-aeeb-c31b67c2b8a8",
	// restaurantId: "23193584-340b-40bf-963e-ac67cbbebd08",
	email:"Al Ameen S",
	role: "CUSTOMER",
};

const token = jwt.sign(payload, env.JWT_ACCESS_PRIVATE_KEY, {
	algorithm: env.JWT_ALGORITHM as jwt.Algorithm,
	keyid: env.JWT_ACCESS_TOKEN_KEY_ID,
	expiresIn: "24h",
});

console.log("\n================ GENERATED JWT ================\n");
console.log(token);
console.log("\n===============================================\n");
