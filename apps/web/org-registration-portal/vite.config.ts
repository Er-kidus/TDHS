import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const apiProxy = {
  "/api": {
    target: process.env.VITE_DEV_API_PROXY_TARGET || "http://localhost:8000",
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, ""),
  },
  "/org": {
    target: process.env.VITE_DEV_API_PROXY_TARGET || "http://localhost:8000",
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5200,
    strictPort: true,
    hmr: {
      overlay: true,
    },
    proxy: apiProxy,
  },
  preview: {
    host: "0.0.0.0",
    port: 4273,
    strictPort: true,
    proxy: apiProxy,
  },
});
