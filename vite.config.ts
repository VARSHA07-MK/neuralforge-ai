import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		preprocessorOptions: {
			scss: {
				// Vite 7 + modern Sass resolve @import relative to the importing file,
				// not the project root, so add the project root to the load paths.
				loadPaths: [path.resolve(process.cwd())],
				additionalData: `@import 'src/styles/variables.scss';`
			}
		}
	},
	server: {
		// Bind IPv4 loopback so `localhost` resolves reliably in browsers.
		// (Vite's default can bind IPv6 `::1` only, which breaks `127.0.0.1`.)
		host: '127.0.0.1',
		fs: {
			// Allow serving files from one level up to the project root
			allow: ['..']
		}
	}
});
