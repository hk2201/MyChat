import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import netlify from "@netlify/vite-plugin";

export default defineConfig({
  plugins: [react(), netlify()],
  server: {
    proxy: {
      "/api": "http://localhost:8000", // Assuming your FastAPI runs here
    },
  },
});
