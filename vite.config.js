import { defineConfig } from "vite";

export default defineConfig({
  /* Relative URLs so `/escape/` vs `/Escape/` and nested deploys resolve assets next to index.html without 404 */
  base: "./",
  appType: "mpa",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
});
