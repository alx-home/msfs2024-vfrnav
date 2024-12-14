import type { Config } from "tailwindcss";
import container_queries from '@tailwindcss/container-queries';

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    container_queries
  ],
} satisfies Config;
