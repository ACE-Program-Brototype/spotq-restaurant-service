import client from "prom-client";
import { env } from "@/config/env.js";

const register = new client.Registry();

register.setDefaultLabels({
	service_name: "restaurant-service",
	environment: env.APP_ENV,
});

client.collectDefaultMetrics({
	register,
});

export default register;
