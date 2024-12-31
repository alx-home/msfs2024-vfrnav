import { defineConfig } from "vite";
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import eslint from 'vite-plugin-eslint';
import path from "path";
import react from '@vitejs/plugin-react'
import sass from 'vite-plugin-sass';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
   build: {
      minify: true,
      rollupOptions: {
         output: {
            manualChunks: undefined,
         },
      },
      ssr: false,
      sourcemap: true,
      emptyOutDir: true,
      target: 'es2017',
   },
   resolve: {
      alias: {
         "@": path.resolve(__dirname, "./src"),
         "@public": path.resolve(__dirname, "./public"),
      },
   },
   plugins: [
      react(),
      sass(),
      eslint(),
      libInjectCss(),
      legacy({
         targets: ['chrome <= 49']
      })
   ],
});