import { defineConfig } from 'vitest/config';

// Engine tests are pure TypeScript (no DOM/Svelte), so we deliberately do NOT
// load the SvelteKit plugin here — just run the specs in a node environment.
export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/lib/**/*.{test,spec}.ts']
	}
});
