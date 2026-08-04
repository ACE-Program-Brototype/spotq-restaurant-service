import client from "prom-client";

const register = new client.Registry();

register.setDefaultLabels({
	service_name: "restaurant-service",
	environment: process.env.APP_ENV,
});

client.collectDefaultMetrics({
	register,
});

export default register;
