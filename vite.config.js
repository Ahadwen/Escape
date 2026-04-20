import { defineConfig } from "vite";

export default defineConfig({
  base: '/Escape-Game/',
  appType: "mpa",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        escape: "game.html",
      },
    },
  },
});
