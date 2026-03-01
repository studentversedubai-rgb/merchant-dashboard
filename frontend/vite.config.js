import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  // Base path for all assets - must be '/' for Cloudflare Pages
  base: '/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    // Output compiled bundle to dist/ (Cloudflare Pages build output directory)
    outDir: 'dist',

    // Generate source maps for easier debugging in production
    sourcemap: false,

    // Ensure assets are properly named with hashes for cache busting
    rollupOptions: {
      output: {
        // JS files → dist/assets/*.js  (served as application/javascript)
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        // CSS, images, fonts → dist/assets/*
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
