import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { host: "127.0.0.1", port: 5174 },
  preview: { host: "127.0.0.1", port: 4174 },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"]
  },
  build: {
    chunkSizeWarningLimit: 700
  }
});

