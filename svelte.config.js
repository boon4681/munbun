import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess()],

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			"@/*": "./src/lib/*",
			"$server/*": "./src/lib/server/*",
			"$schema": "./src/lib/server/db/schema.ts",
			"$db": "./src/lib/server/db/index.ts",
			"$constants": "./src/lib/server/constants.ts",
			'@render': './node_modules/@react-email/render/dist/browser/index.mjs',
		},
	}
};

export default config;
