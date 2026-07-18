import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ compilerOptions: { dev: true } })],
  test: {
    environment: 'jsdom',
    include: ['test/unit/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
    globals: false
  },
  resolve: {
    conditions: ['browser']
  }
});
