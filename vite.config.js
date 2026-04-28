import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  /* Dev: absolute `/` base so Vite client + HMR resolve. Build: relative so GitHub Pages `/RepoName/` works beside index.html. */
  base: command === "build" ? "./" : "/",
  appType: "mpa",
  plugins: [
    /* Vite defaults to injecting the bundle in <head>; run after markup so `#game` is always in DOM when the module executes. */
    {
      name: "escape-emit-bundle-before-body-close",
      apply: "build",
      transformIndexHtml: {
        order: "post",
        handler(html) {
          const scriptRe =
            /<script\s[^>]*type="module"[^>]*src="\.\/assets\/[^"]+\.js"[^>]*>\s*<\/script>\s*/i;
          const m = html.match(scriptRe);
          if (!m) return html;
          const tag = m[0].trim();
          const stripped = html.replace(scriptRe, "");
          if (!stripped.includes("</body>")) return html;
          return stripped.replace("</body>", `    ${tag}\n  </body>`);
        },
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
}));
