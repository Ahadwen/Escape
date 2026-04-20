/**
 * Landing page for `index.html`. The playable prototype lives on `game.html`
 * (`/game.html` in dev) and mounts from `src/escape/entry.js`.
 */
const app = document.getElementById("app");
if (app) {
  app.innerHTML = `
    <main style="max-width:520px;margin:2rem auto;padding:0 1rem;font-family:system-ui,sans-serif;color:#e2e8f0;">
      <h1 style="margin-top:0;">Escape</h1>
      <p style="line-height:1.5;color:#94a3b8;">
        Open <a href="./game.html" style="color:#38bdf8;">game.html</a> for the canvas build
        (hex map, Tetris-style blocks, arrow movement).
      </p>
    </main>
  `;
}
