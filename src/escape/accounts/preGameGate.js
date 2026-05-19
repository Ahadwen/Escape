import { ACHIEVEMENT_ENTRIES } from "./achievementRegistry.js";
import {
  loginAccount,
  registerAccount,
  signInWithGoogle,
  signOutSupabaseAuth,
  syncOAuthAccountFromSession,
} from "./api.js";
import { refreshLoggedInAccount, resumeAccountFromBrowserCookie } from "./sync.js";
import { clearAccountProfile, loadAccountProfile, saveAccountProfile } from "./session.js";
import { ensureSupabaseClient } from "../analytics/client.js";

/** Set true after Google is enabled in Supabase (Authentication → Providers → Google). */
export const GOOGLE_OAUTH_ENABLED = true;

/** @type {Promise<void> | null} */
let gameAllowedPromise = null;
/** @type {(() => void) | null} */
let resolveGameAllowed = null;

/**
 * Resolves once the player chooses Start Game from the main menu (after login).
 * @returns {Promise<void>}
 */
export function whenGameAllowed() {
  if (!gameAllowedPromise) {
    gameAllowedPromise = new Promise((resolve) => {
      resolveGameAllowed = resolve;
    });
  }
  return gameAllowedPromise;
}

function initPreGameGate() {
  const root = document.getElementById("escape-pregame");
  if (!root) {
    resolveGameAllowed?.();
    return;
  }

  document.body.classList.add("escape-pregame-active");

  const loginView = document.getElementById("pregame-login");
  const menuView = document.getElementById("pregame-menu");
  const statsView = document.getElementById("pregame-stats");
  const loginForm = document.getElementById("pregame-login-form");
  const registerForm = document.getElementById("pregame-register-form");
  const loginError = document.getElementById("pregame-login-error");
  const registerError = document.getElementById("pregame-register-error");
  const menuWelcome = document.getElementById("pregame-menu-welcome");
  const statsGrid = document.getElementById("pregame-stats-achievements");
  const statsSummary = document.getElementById("pregame-stats-summary");
  const accountsUnavailable = document.getElementById("pregame-accounts-unavailable");

  const showLoginTabBtn = document.getElementById("pregame-show-login");
  const showRegisterTabBtn = document.getElementById("pregame-show-register");

  /** @param {"login" | "register"} tab */
  function setAuthTab(tab) {
    const isLogin = tab === "login";
    if (loginForm) {
      if (isLogin) loginForm.removeAttribute("hidden");
      else loginForm.setAttribute("hidden", "");
    }
    if (registerForm) {
      if (isLogin) registerForm.setAttribute("hidden", "");
      else registerForm.removeAttribute("hidden");
    }
    showLoginTabBtn?.classList.toggle("pregame-tab--active", isLogin);
    showRegisterTabBtn?.classList.toggle("pregame-tab--active", !isLogin);
  }

  /** @param {"login" | "menu" | "stats"} view */
  function showView(view) {
    const setPanel = (el, visible) => {
      if (!el) return;
      if (visible) el.removeAttribute("hidden");
      else el.setAttribute("hidden", "");
    };
    setPanel(loginView, view === "login");
    setPanel(menuView, view === "menu");
    setPanel(statsView, view === "stats");
  }

  /** @param {HTMLElement | null} el */
  /** @param {string} message */
  function setError(el, message) {
    if (!el) return;
    if (!message) {
      el.hidden = true;
      el.textContent = "";
      return;
    }
    el.hidden = false;
    el.textContent = message;
  }

  function updateMenuCopy() {
    const profile = loadAccountProfile();
    if (menuWelcome && profile) {
      menuWelcome.textContent = `Signed in as ${profile.username}`;
    }
  }

  /** @param {import('./session.js').EscapeAccountProfile} profile */
  function renderStats(profile) {
    if (statsSummary) {
      const unlocked = ACHIEVEMENT_ENTRIES.filter((e) => profile[e.column]).length;
      statsSummary.innerHTML = `
        <p><strong>${escapeHtml(profile.username)}</strong> · ${escapeHtml(profile.email)}</p>
        <p>Highest level reached: <strong>L${profile.max_display_level ?? 1}</strong></p>
        <p>Runs played: <strong>${profile.run_count ?? 0}</strong></p>
        <p>Achievements: <strong>${unlocked}</strong> / ${ACHIEVEMENT_ENTRIES.length}</p>
      `;
    }
    if (!statsGrid) return;
    statsGrid.replaceChildren();

    const groups = [
      { id: "levels", label: "Level & path clears" },
      { id: "suits", label: "Full suit decks (13/13)" },
      { id: "victory", label: "Victory" },
    ];

    for (const group of groups) {
      const heading = document.createElement("h3");
      heading.className = "pregame-stats-group-title";
      heading.textContent = group.label;
      statsGrid.appendChild(heading);

      const list = document.createElement("ul");
      list.className = "pregame-ach-list";
      for (const entry of ACHIEVEMENT_ENTRIES.filter((e) => e.group === group.id)) {
        const done = !!profile[entry.column];
        const li = document.createElement("li");
        li.className = done ? "pregame-ach pregame-ach--done" : "pregame-ach";
        li.innerHTML = `
          <span class="pregame-ach-mark" aria-hidden="true">${done ? "✓" : "○"}</span>
          <span class="pregame-ach-text">
            <strong>${escapeHtml(entry.title)}</strong>
            <span>${escapeHtml(entry.detail)}</span>
          </span>
        `;
        list.appendChild(li);
      }
      statsGrid.appendChild(list);
    }
  }

  function enterMenu() {
    updateMenuCopy();
    showView("menu");
  }

  function enterLogin() {
    showView("login");
    setAuthTab("login");
    setError(loginError, "");
    setError(registerError, "");
  }

  async function probeAccountsBackend() {
    const client = await ensureSupabaseClient();
    if (!client) {
      accountsUnavailable?.removeAttribute("hidden");
      return false;
    }
    accountsUnavailable?.setAttribute("hidden", "");
    return true;
  }

  const oauthBlock = document.querySelector(".pregame-oauth-block");
  const googleLoginBtn = document.getElementById("pregame-google-login");
  if (GOOGLE_OAUTH_ENABLED) {
    oauthBlock?.removeAttribute("hidden");
    googleLoginBtn?.removeAttribute("hidden");
    oauthBlock?.setAttribute("data-google-oauth", "on");
  } else {
    oauthBlock?.setAttribute("hidden", "");
    googleLoginBtn?.setAttribute("hidden", "");
    oauthBlock?.setAttribute("data-google-oauth", "off");
  }

  async function tryResumeOAuthSession() {
    if (!GOOGLE_OAUTH_ENABLED) return false;
    try {
      const profile = await syncOAuthAccountFromSession();
      if (profile) {
        saveAccountProfile(profile);
        enterMenu();
        return true;
      }
    } catch (err) {
      console.warn("[Escape accounts] OAuth resume:", err);
    }
    return false;
  }

  (async () => {
    if (await tryResumeOAuthSession()) {
      probeAccountsBackend();
      return;
    }

    const fromCookie = await resumeAccountFromBrowserCookie();
    if (fromCookie) {
      enterMenu();
      probeAccountsBackend();
      return;
    }

    const stored = loadAccountProfile();
    if (stored) {
      enterMenu();
      refreshLoggedInAccount().then((profile) => {
        if (profile) updateMenuCopy();
      });
    } else {
      enterLogin();
    }
    probeAccountsBackend();
  })();

  showLoginTabBtn?.addEventListener("click", () => {
    setAuthTab("login");
    setError(loginError, "");
    setError(registerError, "");
  });
  showRegisterTabBtn?.addEventListener("click", () => {
    setAuthTab("register");
    setError(loginError, "");
    setError(registerError, "");
  });

  loginForm?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    setError(loginError, "");
    const fd = new FormData(loginForm);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = true;
    try {
      const profile = await loginAccount({ email, password });
      saveAccountProfile(profile);
      enterMenu();
    } catch (err) {
      setError(loginError, err instanceof Error ? err.message : "Login failed");
    } finally {
      if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = false;
    }
  });

  registerForm?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    setError(registerError, "");
    const fd = new FormData(registerForm);
    const username = String(fd.get("username") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password !== confirm) {
      setError(registerError, "Passwords do not match");
      return;
    }
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = true;
    try {
      const profile = await registerAccount({ username, email, password });
      saveAccountProfile(profile);
      enterMenu();
    } catch (err) {
      setError(registerError, err instanceof Error ? err.message : "Registration failed");
    } finally {
      if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = false;
    }
  });

  document.getElementById("pregame-start-game")?.addEventListener("click", () => {
    root.setAttribute("hidden", "");
    document.body.classList.remove("escape-pregame-active");
    resolveGameAllowed?.();
  });

  document.getElementById("pregame-open-stats")?.addEventListener("click", async () => {
    const profile = (await refreshLoggedInAccount()) ?? loadAccountProfile();
    if (profile) renderStats(profile);
    showView("stats");
  });

  document.getElementById("pregame-stats-back")?.addEventListener("click", () => {
    enterMenu();
  });

  if (GOOGLE_OAUTH_ENABLED) {
    document.getElementById("pregame-google-login")?.addEventListener("click", async () => {
      setError(loginError, "");
      setError(registerError, "");
      const btn = document.getElementById("pregame-google-login");
      if (btn instanceof HTMLButtonElement) btn.disabled = true;
      try {
        await signInWithGoogle();
      } catch (err) {
        setError(loginError, err instanceof Error ? err.message : "Google sign-in failed");
        if (btn instanceof HTMLButtonElement) btn.disabled = false;
      }
    });
  }

  document.getElementById("pregame-logout")?.addEventListener("click", async () => {
    await signOutSupabaseAuth();
    clearAccountProfile();
    enterLogin();
    setError(loginError, "");
    setError(registerError, "");
  });
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

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPreGameGate, { once: true });
  } else {
    initPreGameGate();
  }
}
