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
    // Add middleware to set correct Content-Type headers
    middlewares: [
      {
        name: "set-content-type-headers",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url.endsWith(".json")) {
              res.setHeader("Content-Type", "application/json");
            } else if (req.url.endsWith(".js") || req.url.endsWith(".mjs")) {
              res.setHeader("Content-Type", "application/javascript");
            }
            next();
          });
        },
      },
    ],
  },
  // Copy service worker and manifest to dist folder during production build
  plugins: [
    {
      name: "copy-sw-manifest",
      apply: "build",
      generateBundle() {
        // Emit service worker file
        this.emitFile({
          type: "asset",
          fileName: "sw.js",
          source: fs.readFileSync("./sw.js", "utf-8"),
        });

        // Emit manifest with proper JSON formatting
        const manifestContent = fs.readFileSync("./manifest.json", "utf-8");
        try {
          // Parse and stringify to ensure valid JSON
          const manifestJson = JSON.parse(manifestContent);
          this.emitFile({
            type: "asset",
            fileName: "manifest.json",
            source: JSON.stringify(manifestJson, null, 2),
          });
        } catch (e) {
          console.error("Error parsing manifest.json:", e);
          // Fallback to original content
          this.emitFile({
            type: "asset",
            fileName: "manifest.json",
            source: manifestContent,
          });
        }
      },
    },
  ],
});
