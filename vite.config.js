import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

export default defineConfig({
  root: "./",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  // Copy service worker and manifest to dist folder during production build
  plugins: [
    {
      name: "copy-sw-manifest",
      apply: "build",
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "sw.js",
          source: fs.readFileSync("./sw.js", "utf-8"),
        });
        this.emitFile({
          type: "asset",
          fileName: "manifest.json",
          source: fs.readFileSync("./manifest.json", "utf-8"),
        });
      },
    },
  ],
});
