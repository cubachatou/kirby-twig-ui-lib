import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'assets/dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: 'assets/js/main.js',
      },
    },
  },
})
