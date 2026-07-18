import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: 'dist/webview',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/webview/main.ts',
      output: {
        entryFileNames: 'main.js',
        assetFileNames: 'main.[ext]'
      }
    }
  }
});
