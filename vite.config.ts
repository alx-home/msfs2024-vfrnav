import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint';
import { peerDependencies } from "./package.json";
import sass from 'vite-plugin-sass';
import path from "path";

export default defineConfig({
   build: {
      lib: {
         entry: "./src/main.tsx",
         name: "msfs2024-vfrnav",
         fileName: (format) => `index.${format}.js`,
         formats: ["cjs", "es"],
      },
      rollupOptions: {
         external: [...Object.keys(peerDependencies)],
      },
      sourcemap: true,
      emptyOutDir: true,
   },
   resolve: {
      alias: {
         "@": path.resolve(__dirname, "./src"),
         "@public": path.resolve(__dirname, "./public"),
      },
   },
   plugins: [
      dts(),
      react(),
      sass(),
      eslint()
   ],
});