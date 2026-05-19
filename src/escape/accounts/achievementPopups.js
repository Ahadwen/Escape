import { ACHIEVEMENT_ENTRIES, getAchievementEntry } from "./achievementRegistry.js";
import { loadAccountProfile } from "./session.js";

const TOAST_LIFETIME_MS = 3800;
const TOAST_STAGGER_MS = 520;

/** @type {Set<string>} */
const shownKeys = new Set();

/** @type {HTMLElement | null} */
let toastRoot = null;

function ensureToastRoot() {
  const stage = document.querySelector(".canvas-stage");
  const parent = stage ?? document.body;

  if (toastRoot && parent.contains(toastRoot)) return toastRoot;

  toastRoot = document.getElementById("escape-achievement-toasts");
  if (!toastRoot) {
    toastRoot = document.createElement("div");
    toastRoot.id = "escape-achievement-toasts";
    toastRoot.className = "escape-achievement-toasts";
    toastRoot.setAttribute("aria-live", "polite");
    toastRoot.setAttribute("aria-relevant", "additions");
    parent.appendChild(toastRoot);
  } else if (stage && toastRoot.parentElement !== stage) {
    stage.appendChild(toastRoot);
  }
  return toastRoot;
}

/**
 * @param {string} key
 * @param {import('./session.js').EscapeAccountProfile | null | undefined} profileBefore
 * @returns {boolean}
 */
function isNewAchievementKey(key, profileBefore) {
  if (shownKeys.has(key)) return false;
  const entry = getAchievementEntry(key);
  if (!entry) return false;
  if (profileBefore && profileBefore[entry.column]) return false;
  return true;
}

/**
 * @param {string} key
 * @param {number} staggerIndex
 */
function showAchievementToast(key, staggerIndex = 0) {
  const entry = getAchievementEntry(key);
  if (!entry) return;

  shownKeys.add(key);
  const root = ensureToastRoot();

  const delay = staggerIndex * TOAST_STAGGER_MS;
  window.setTimeout(() => {
    const el = document.createElement("div");
    el.className = "escape-ach-toast";
    el.setAttribute("role", "status");
    el.innerHTML = `
      <span class="escape-ach-toast-mark" aria-hidden="true">✦</span>
      <span class="escape-ach-toast-body">
        <span class="escape-ach-toast-label">Achievement unlocked</span>
        <strong class="escape-ach-toast-title">${escapeHtml(entry.title)}</strong>
        <span class="escape-ach-toast-detail">${escapeHtml(entry.detail)}</span>
      </span>
    `;
    root.appendChild(el);

    requestAnimationFrame(() => {
      el.classList.add("escape-ach-toast--visible");
    });

    window.setTimeout(() => {
      el.classList.add("escape-ach-toast--out");
      window.setTimeout(() => el.remove(), 320);
    }, TOAST_LIFETIME_MS);
  }, delay);
}

/**
 * Show popups for keys newly earned this segment (not already on account profile).
 * @param {string[]} keys
 * @param {import('./session.js').EscapeAccountProfile | null} [profileBefore]
 */
export function queueAchievementPopupsFromKeys(keys, profileBefore = loadAccountProfile()) {
  if (typeof document === "undefined" || !keys?.length) return;

  const novel = keys.filter((key) => isNewAchievementKey(key, profileBefore));
  novel.forEach((key, i) => showAchievementToast(key, i));
}

/** Clear per-page dedupe (e.g. tests). */
export function resetAchievementPopupSession() {
  shownKeys.clear();
}

/**
 * @param {string} raw
 */
function escapeHtml(raw) {
  return String(raw)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
