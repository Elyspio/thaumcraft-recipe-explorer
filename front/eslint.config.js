import config from "@elyspio/vite-eslint-config/eslint.config.mjs";

/**
 * @type {import("eslint").Linter.Config[]}
 */
export default [
	...config,
	{
		ignores: ["**/node_modules/**", "public/*", "dist/**"],
	},
];
