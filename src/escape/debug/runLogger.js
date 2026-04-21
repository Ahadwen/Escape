const MAX_LINES_DEFAULT = 30;

function fmtNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

export function createRunLogger(maxLines = MAX_LINES_DEFAULT) {
  const lines = [];
  /** @type {null | ((text: string) => void)} */
  let onChange = null;

  function emit(level, scope, message, data) {
    const suffix = data == null ? "" : ` ${safeJson(data)}`;
    const line = `[${fmtNow()}] ${level.toUpperCase()} ${scope}: ${message}${suffix}`;
    lines.push(line);
    while (lines.length > maxLines) lines.shift();
    onChange?.(lines.join("\n"));
    if (level === "error") console.error(line);
  }

  return {
    log(scope, message, data) {
      emit("log", scope, message, data);
    },
    error(scope, message, err) {
      emit("error", scope, message, err instanceof Error ? { message: err.message, stack: err.stack } : err);
    },
    bindTextSink(fn) {
      onChange = fn;
      onChange?.(lines.join("\n"));
    },
    lines: () => [...lines],
    text: () => lines.join("\n"),
    clear() {
      lines.length = 0;
      onChange?.("");
    },
  };
}

function safeJson(v) {
  try {
    return JSON.stringify(v);
  } catch {
    return "[unserializable]";
  }
}

/**
 * Wraps function properties so each call can log start/end/errors.
 * Intended for debug mode runtime objects (character, specials, flows, modals, etc).
 */
export function instrumentObjectMethods(target, scope, logger, options = {}) {
  if (!target || typeof target !== "object") return target;
  const skip = new Set(options.skip ?? []);
  for (const key of Object.keys(target)) {
    if (skip.has(key)) continue;
    const v = target[key];
    if (typeof v !== "function") continue;
    target[key] = (...args) => {
      logger.log(scope, `${key}()`, args.length ? { argc: args.length } : undefined);
      try {
        return v(...args);
      } catch (err) {
        logger.error(scope, `${key}() failed`, err);
        throw err;
      }
    };
  }
  return target;
}
