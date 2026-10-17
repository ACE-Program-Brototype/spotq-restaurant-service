import jwt from "jsonwebtoken";
import { env } from "@/config/env.ts";

const payload = {
	sub: "23193584-340b-40bf-963e-ac67cbbebd08",
	restaurantId: "23193584-340b-40bf-963e-ac67cbbebd08",
	email: "jassymon114@gmail.com",
	role: "RESTAURANT_OWNER",
};

const token = jwt.sign(payload, env.JWT_ACCESS_PRIVATE_KEY, {
	algorithm: env.JWT_ALGORITHM as jwt.Algorithm,
	keyid: env.JWT_ACCESS_TOKEN_KEY_ID,
	expiresIn: "24h",
});

console.log("\n================ GENERATED JWT ================\n");
console.log(token);
console.log("\n===============================================\n");
