import { generateToken } from "@spotq-org/s2s-core";

const issuerConfig = {
	serviceName: "queue-service",
	privateKey: `PRIVATE KEY FILL HERE`
};

const token = generateToken("restaurant-service", issuerConfig);

console.log(token)
