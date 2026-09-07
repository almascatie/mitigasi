import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",

    proxy: {
      "/bnpb": {
        target: "https://gis.bnpb.go.id",
        changeOrigin: true,
        secure: false,

        rewrite: (path) =>
          path.replace(/^\/bnpb/, ""),

        configure: (proxy) => proxy.on("error", (error) => console.error("[BNPB PROXY ERROR]", error)),
      },
    },
  },
});
