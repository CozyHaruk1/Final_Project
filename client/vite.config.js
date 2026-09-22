import { defineConfig, transformWithOxc } from "vite";
import react from "@vitejs/plugin-react";

function jsxInJs() {
  return {
    name: "jsx-in-js",
    enforce: "pre",

    async transform(code, id) {
      if (!id.endsWith(".js") || id.includes("node_modules")) {
        return null;
      }

      return transformWithOxc(code, id, {
        lang: "jsx",
        jsx: {
          runtime: "automatic",
        },
      });
    },
  };
}

export default defineConfig({
  plugins: [
    jsxInJs(),
    react({
      include: /\.(js|jsx|ts|tsx)$/,
    }),
  ],

  server: {
    port: 3000,
  },
});