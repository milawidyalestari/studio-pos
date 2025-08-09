import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [
    react(),
    // No lovable-tagger for Electron to avoid ESM conflicts
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['lovable-tagger'],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['lovable-tagger'],
    },
  },
})
