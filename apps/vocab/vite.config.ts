import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Vocab's own API + the shared integration contract are all on :4000.
      '/api': 'http://localhost:4000',
    },
  },
});
