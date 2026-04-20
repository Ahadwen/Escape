/**
 * Local-dev run log: ring buffer (newest in, oldest out), manual print / download.
 */
import * as Codes from "./log-codes.js";

/** Max retained log lines (FIFO). */
export const RUN_LOG_MAX_ENTRIES = 30;

function pad2(n) {
  return String(n).padStart(2, "0");
}

function sessionStamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
}

function randomSuffix() {
  return Math.random().toString(16).slice(2, 6);
}

function formatDetail(detail) {
  if (detail == null) return "";
  if (typeof detail === "string") return detail;
  try {
    return JSON.stringify(detail);
  } catch {
    return String(detail);
  }
}

/**
 * @param {{ enabled: boolean }} opts
 */
export function createRunLog({ enabled }) {
  const sessionId = `ESC-${sessionStamp()}-${randomSuffix()}`;
  /** @type {string[]} */
  const lines = [];

  function push(level, code, message, detail) {
    if (!enabled) return;
    const ts = new Date().toISOString();
    const tail = detail != null ? ` | ${formatDetail(detail)}` : "";
    const line = `[${ts}] [${level}] ${code} — ${message}${tail}`;
    lines.push(line);
    while (lines.length > RUN_LOG_MAX_ENTRIES) lines.shift();
  }

  return {
    sessionId,
    enabled,
    getLines() {
      return enabled ? [...lines] : [];
    },
    /** Dump current buffer to the browser console (oldest → newest). */
    printToConsole() {
      if (!enabled) return;
      const snapshot = [...lines];
      const label = `Escape run log (${snapshot.length}/${RUN_LOG_MAX_ENTRIES}) session=${sessionId}`;
      console.group(label);
      if (snapshot.length === 0) console.log("(empty)");
      else for (const line of snapshot) console.log(line);
      console.groupEnd();
    },
    /** Download current buffer as a `.txt` file. */
    downloadTxt() {
      if (!enabled || lines.length === 0) return;
      try {
        const body = [
          `Escape run log`,
          `sessionId=${sessionId}`,
          `entries=${lines.length} (max ${RUN_LOG_MAX_ENTRIES})`,
          "",
          ...lines,
          "",
        ].join("\n");
        const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `escape-run-${sessionId}.txt`;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2500);
      } catch (err) {
        console.error(Codes.E_RUN_LOG_FINALIZE, err);
      }
    },
    /** Gameplay / UX events (pickups, modals, etc.) */
    event(code, message, detail) {
      push("EVENT", code, message, detail);
    },
    /** Non-fatal anomalies */
    warn(code, message, detail) {
      push("WARN", code, message, detail);
    },
    /**
     * Human-readable failure plus optional detail.
     * @param {string} code
     * @param {string} humanMessage
     * @param {unknown} [err]
     */
    fail(code, humanMessage, err) {
      const detail =
        err instanceof Error
          ? { name: err.name, message: err.message, stack: err.stack }
          : err != null
            ? { value: String(err) }
            : undefined;
      if (enabled) push("ERROR", code, humanMessage, detail);
      else if (err) console.error(code, humanMessage, err);
      else console.error(code, humanMessage);
    },
  };
}
