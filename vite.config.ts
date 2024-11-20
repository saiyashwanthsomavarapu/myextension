import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "out/webview-ui",
    rollupOptions: {
      input: {
        initialize: path.resolve(__dirname, "src/webview-ui/Configuration.tsx"),
        sidebar: path.resolve(__dirname, "src/webview-ui/Sidebar.tsx"),
        chatlayout: path.resolve(__dirname, "src/webview-ui/ChatLayout.tsx"),
      },
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
