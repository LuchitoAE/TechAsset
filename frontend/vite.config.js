import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Tailwind 4 se integra como plugin de Vite: no necesita tailwind.config.js ni postcss.config.js.
  plugins: [react(), tailwindcss()],
  server: {
    port: 5191,
    strictPort: true,
    // Las peticiones a /api se reenvían a la API: el navegador ve un solo origen y no hace falta CORS.
    proxy: {
      '/api': 'http://localhost:5321',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/pruebas/configuracion.js',
    css: false,
  },
})
