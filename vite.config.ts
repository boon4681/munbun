import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { env } from 'process';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
})