import { fileURLToPath } from "node:url";
import { getDefaultConfig } from "@elyspio/vite-eslint-config";
import { defineConfig } from "vite-plus";
import { playwright } from "vitest/browser-playwright";

// mkcert (HTTPS) is disabled so the dev server runs over plain HTTP — simpler
// for a static client-only app and compatible with headless preview tooling.
const config = getDefaultConfig({ basePath: import.meta.dirname, useMkcert: false });

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const customAliases = {
	"@data": r("./src/core/data"),
	"@components": r("./src/view/components"),
	"@hooks": r("./src/view/hooks"),
	"@": r("./src"),
};
const defaultAliases = config.resolve?.alias;
const aliases = [
	...(Array.isArray(defaultAliases)
		? defaultAliases
		: Object.entries(defaultAliases ?? {}).map(([find, replacement]) => ({ find, replacement }))),
	...Object.entries(customAliases).map(([find, replacement]) => ({ find, replacement })),
];

export default defineConfig({
	...config,
	resolve: {
		...config.resolve,
		alias: aliases,
	},
	fmt: {
		...config.fmt,
		ignorePatterns: [...config.fmt.ignorePatterns, "public/**"],
	},
	lint: {
		...config.lint,
		ignorePatterns: [...config.lint.ignorePatterns, "public/**"],
	},
	test: {
		browser: {
			enabled: true,
			provider: playwright(),
			headless: true,
			instances: [{ browser: "chromium" }],
		},
	},
});
