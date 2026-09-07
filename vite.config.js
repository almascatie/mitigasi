import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import https from "https";

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

        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader(
              "User-Agent",
              "Mozilla/5.0"
            );

            proxyReq.setHeader(
              "Accept",
              "image/png,image/*,*/*"
            );
          });

          proxy.on("error", (error) => {
            console.error(
              "[BNPB PROXY ERROR]",
              error
            );
          });
        },
      },
    },
  },
});