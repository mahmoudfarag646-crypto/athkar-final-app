import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // This is CRITICAL for mobile apps (Capacitor/Cordova).
  // It ensures assets are loaded relatively (e.g., "./script.js") instead of absolutely ("/script.js").
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});