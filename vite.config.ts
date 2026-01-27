import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/freepik-api': {
        target: 'https://api.freepik.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/freepik-api/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // 🚨 CRITICAL: Aggressively strip all headers to mimic the working Node.js script.
            // Browser headers (User-Agent, Sec-CH-UA, etc.) trigger Freepik's WAF (403 Forbidden).

            // 1. Capture the API Key from the incoming request (it's in the headers)
            // Note: req.headers keys are lowercased by Node
            const apiKey = req.headers['x-freepik-api-key'];

            // 2. Remove ALL existing headers from the outgoing proxy request
            const names = proxyReq.getHeaderNames();
            names.forEach(name => proxyReq.removeHeader(name));

            // 3. Re-set ONLY the headers that worked in our test script
            proxyReq.setHeader('Host', 'api.freepik.com'); // ✨ CRITICAL: Host header is required for SNI/HTTP1.1
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Accept-Language', 'ko-KR');
            if (apiKey) {
              proxyReq.setHeader('X-Freepik-API-Key', apiKey); // ✨ Match script casing exactly
            }
            // Host is handled by changeOrigin: true (sets it to api.freepik.com)
          });
        },
      },
    },
  },
})
