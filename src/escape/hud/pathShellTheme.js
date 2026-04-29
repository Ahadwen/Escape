/**
 * Maps active run path → document CSS variables for the HTML chrome (deck, modals, dev shell).
 * Uses the same “panel slightly lighter than deepest ink” relationship as the default navy,
 * shifted per path (fire / swamp / bone). Base run (no path yet) keeps the original slate stack.
 */

/** @typedef {keyof typeof SHELL_THEMES} ShellThemeId */

const SHELL_THEMES = {
  default: {
    body: "#111827",
    panel: "#1e293b",
    deep: "#0f172a",
    mid: "#111827",
    veil: "#0b1220",
    panelAlt: "#1f2937",
    border: "#334155",
    borderBright: "#475569",
    hover: "#334155",
    bpA: "#172033",
    bpB: "#0c1424",
    inkOnLight: "#0f172a",
    inkRgb: "2, 6, 23",
    deepRgb: "15, 23, 42",
    panelRgb: "30, 41, 59",
  },
  fire: {
    body: "#1a1010",
    panel: "#422626",
    deep: "#2c1515",
    mid: "#1c0e0e",
    veil: "#120909",
    panelAlt: "#3a2323",
    border: "#4a3535",
    borderBright: "#5c4545",
    hover: "#5a3a3a",
    bpA: "#301a1a",
    bpB: "#140808",
    inkOnLight: "#2c1515",
    inkRgb: "26, 8, 8",
    deepRgb: "44, 21, 21",
    panelRgb: "66, 38, 38",
  },
  swamp: {
    body: "#101816",
    panel: "#1e332c",
    deep: "#142922",
    mid: "#0f1a16",
    veil: "#0a100d",
    panelAlt: "#1a2d26",
    border: "#2a3f36",
    borderBright: "#3d5249",
    hover: "#2f4a3e",
    bpA: "#163026",
    bpB: "#0a1510",
    inkOnLight: "#142922",
    inkRgb: "6, 18, 12",
    deepRgb: "20, 41, 34",
    panelRgb: "36, 58, 48",
  },
  bone: {
    body: "#151618",
    panel: "#343842",
    deep: "#23262d",
    mid: "#141518",
    veil: "#0b0c0f",
    panelAlt: "#2d313a",
    border: "#3d424d",
    borderBright: "#525866",
    hover: "#4a505e",
    bpA: "#282c35",
    bpB: "#12141a",
    inkOnLight: "#23262d",
    inkRgb: "12, 14, 18",
    deepRgb: "35, 38, 45",
    panelRgb: "52, 56, 66",
  },
};

/**
 * @param {string | null | undefined} pathId
 */
export function applyPathShellTheme(pathId) {
  const key =
    pathId === "fire" || pathId === "swamp" || pathId === "bone" ? /** @type {ShellThemeId} */ (pathId) : "default";
  const t = SHELL_THEMES[key];
  const r = document.documentElement;
  r.style.setProperty("--escape-ui-body", t.body);
  r.style.setProperty("--escape-ui-panel", t.panel);
  r.style.setProperty("--escape-ui-deep", t.deep);
  r.style.setProperty("--escape-ui-mid", t.mid);
  r.style.setProperty("--escape-ui-veil", t.veil);
  r.style.setProperty("--escape-ui-panel-alt", t.panelAlt);
  r.style.setProperty("--escape-ui-border", t.border);
  r.style.setProperty("--escape-ui-border-bright", t.borderBright);
  r.style.setProperty("--escape-ui-hover", t.hover);
  r.style.setProperty("--escape-ui-bp-a", t.bpA);
  r.style.setProperty("--escape-ui-bp-b", t.bpB);
  r.style.setProperty("--escape-ui-ink-on-light", t.inkOnLight);
  r.style.setProperty("--escape-ui-ink-rgb", t.inkRgb);
  r.style.setProperty("--escape-ui-deep-rgb", t.deepRgb);
  r.style.setProperty("--escape-ui-panel-rgb", t.panelRgb);
}
