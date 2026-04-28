import { defineConfig } from "vite";

export default defineConfig({
  base: "/Escape/",
  appType: "mpa",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
});
