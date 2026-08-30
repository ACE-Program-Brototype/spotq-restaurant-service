import type { Config } from "jest";

const config: Config = {
	testEnvironment: "node",
	extensionsToTreatAsEsm: [".ts"],
	moduleNameMapper: {
		"^@domain/(.*)\\.ts$": "<rootDir>/src/domain/$1.ts",
		"^@domain/(.*)$": "<rootDir>/src/domain/$1",
		"^@application/(.*)\\.ts$": "<rootDir>/src/application/$1.ts",
		"^@application/(.*)$": "<rootDir>/src/application/$1",
		"^@dtos/(.*)\\.ts$": "<rootDir>/src/application/dtos/$1.ts",
		"^@dtos/(.*)$": "<rootDir>/src/application/dtos/$1",
		"^@ports/(.*)\\.ts$": "<rootDir>/src/application/ports/$1.ts",
		"^@ports/(.*)$": "<rootDir>/src/application/ports/$1",
		"^@use-cases/(.*)\\.ts$": "<rootDir>/src/application/use-cases/$1.ts",
		"^@use-cases/(.*)$": "<rootDir>/src/application/use-cases/$1",
		"^@infrastructure/(.*)\\.ts$": "<rootDir>/src/infrastructure/$1.ts",
		"^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
		"^@presentation/(.*)\\.ts$": "<rootDir>/src/presentation/$1.ts",
		"^@presentation/(.*)$": "<rootDir>/src/presentation/$1",
		"^@interfaces/(.*)\\.ts$": "<rootDir>/src/interfaces/$1.ts",
		"^@interfaces/(.*)$": "<rootDir>/src/interfaces/$1",
		"^@config/(.*)\\.ts$": "<rootDir>/src/config/$1.ts",
		"^@config/(.*)$": "<rootDir>/src/config/$1",
		"^@di/(.*)\\.ts$": "<rootDir>/src/config/di/$1.ts",
		"^@di/(.*)$": "<rootDir>/src/config/di/$1",
		"^@modules/(.*)\\.ts$": "<rootDir>/src/modules/$1.ts",
		"^@modules/(.*)$": "<rootDir>/src/modules/$1",
		"^@shared/(.*)\\.ts$": "<rootDir>/src/shared/$1.ts",
		"^@shared/(.*)$": "<rootDir>/src/shared/$1",
		"^@utils/(.*)\\.ts$": "<rootDir>/src/utils/$1.ts",
		"^@utils/(.*)$": "<rootDir>/src/utils/$1",
		"^@/(.*)\\.ts$": "<rootDir>/src/$1.ts",
		"^@/(.*)\\.js$": "<rootDir>/src/$1.ts",
		"^@/(.*)$": "<rootDir>/src/$1",
		"^(\\./.+)\\.js$": "$1",
		"^(\\.\\./.+)\\.js$": "$1",
	},
	transform: {
		"^.+\\.(t|j)sx?$": [
			"@swc/jest",
			{
				jsc: {
					parser: {
						syntax: "typescript",
						decorators: true,
						dynamicImport: true,
					},
					transform: {
						legacyDecorator: true,
						decoratorMetadata: true,
					},
					target: "es2022",
				},
				module: {
					type: "es6",
				},
			},
		],
	},
	testMatch: ["<rootDir>/tests/**/*.spec.ts", "<rootDir>/tests/**/*.test.ts"],
	setupFiles: ["<rootDir>/tests/setup.ts"],
};

export default config;
