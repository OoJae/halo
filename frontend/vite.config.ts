import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// snarkjs (via ffjavascript) needs Buffer/process in the browser; node polyfills
// provide them. snarkjs is excluded from dep optimization (it's CJS + workers).
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["buffer", "process", "stream", "util", "vm"],
      globals: { Buffer: true, process: true },
    }),
  ],
  optimizeDeps: { exclude: ["snarkjs"] },
  server: {
    port: 5173,
    // Proxy issuer API to the local Express server (no CORS).
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
});
