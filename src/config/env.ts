const requiredEnvironmentVariable = (name: string): string => {
	const value = process.env[name]?.trim();
	if (!value) throw new Error(`Missing required environment variable: ${name}`);
	return value;
};

const parsePort = (value: string): number => {
	if (!/^\d+$/.test(value)) throw new Error("PORT must be an integer between 1 and 65535");
	const port = Number(value);
	if (port < 1 || port > 65535) throw new Error("PORT must be an integer between 1 and 65535");
	return port;
};

const parseUrl = (name: string, allowedProtocols: string[]): string => {
	const value = requiredEnvironmentVariable(name);
	try {
		const url = new URL(value);
		if (!allowedProtocols.includes(url.protocol)) throw new Error();
	} catch {
		throw new Error(`${name} must be a valid URL using one of: ${allowedProtocols.join(", ")}`);
	}
	return value;
};

export const env = Object.freeze({
	PORT: parsePort(requiredEnvironmentVariable("PORT")),
	DATABASE_URL: parseUrl("DATABASE_URL", ["postgres:", "postgresql:"]),
	REDIS_URL: parseUrl("REDIS_URL", ["redis:", "rediss:"]),
	APP_ENV: process.env.APP_ENV?.trim() || "development",
});
