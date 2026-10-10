import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy API calls in dev so frontends never hardcode the API port.
    proxy: { '/api': 'http://localhost:4000' },
  },
});
