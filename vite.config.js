import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const prod = mode === "production";
  const outDir = prod ? "dist/prod" : "dist/staging";

  return {
    root: "src",

    build: {
      outDir: `../${outDir}`,
      emptyOutDir: true,
      minify: prod && "terser",
      sourcemap: !prod,
      manifest: true, // Generate manifest.json

      rollupOptions: {
        input: {
          main: resolve(__dirname, "src/main.js"),
        },
        output: {
          // Use hashed filenames for better caching
          entryFileNames: prod ? "assets/[name].[hash].js" : "assets/[name].js",
          assetFileNames: prod
            ? "assets/[name].[hash].[ext]"
            : "assets/[name].[ext]",
        },
      },

      terserOptions: prod
        ? { compress: { drop_console: true, drop_debugger: true } }
        : undefined,
    },

    css: {
      devSourcemap: !prod,
    },
  };
});
