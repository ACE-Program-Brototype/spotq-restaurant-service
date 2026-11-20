import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/server.ts"],
	format: ["esm"],
	platform: "node",
	target: "node22",
	outDir: "dist",
	clean: true,
	sourcemap: true,
	splitting: false,
	dts: false,
	esbuildOptions(options) {
		options.alias = {
			"@domain": "./src/domain",
			"@application": "./src/application",
			"@dtos": "./src/application/dtos",
			"@ports": "./src/application/ports",
			"@use-cases": "./src/application/use-cases",
			"@infrastructure": "./src/infrastructure",
			"@presentation": "./src/presentation",
			"@interfaces": "./src/interfaces",
			"@config": "./src/config",
			"@di": "./src/config/di",
			"@modules": "./src/modules",
			"@shared": "./src/shared",
			"@utils": "./src/utils",
			"@": "./src",
		};
	},
});
