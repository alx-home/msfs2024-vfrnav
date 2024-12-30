import { defineConfig } from "vite";
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import { peerDependencies } from "./package.json";
import dts from "vite-plugin-dts";
import eslint from 'vite-plugin-eslint';
import path from "path";
import react from '@vitejs/plugin-react'
import sass from 'vite-plugin-sass';

export default defineConfig({
   build: {
      lib: {
         entry: "./src/app/App.tsx",
         name: "msfs2024-vfrnav",
         fileName: (format) => `App.${format}.js`,
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
      eslint(),
      libInjectCss(),
   ],
});