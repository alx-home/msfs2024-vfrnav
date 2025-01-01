import { defineConfig } from "vite";
import eslint from 'vite-plugin-eslint';
import path from "path";
import react from '@vitejs/plugin-react'
import sass from 'vite-plugin-sass';
import legacy from '@vitejs/plugin-legacy';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
   build: {
      minify: true,
      rollupOptions: {
         output: {
            manualChunks: undefined,
         }
      },
      ssr: false,
      sourcemap: false,
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
      cssInjectedByJsPlugin(),
      eslint(),
      legacy({
         targets: ['chrome <= 49']
      })
   ],
   css: {
      postcss: './postcss.config.mjs',
   }
});