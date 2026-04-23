/**
 * @typedef {{ remaining: number; duration: number; color: string }} AbilityCooldownFill
 * @typedef {{ label: string; value: string; fill?: AbilityCooldownFill; valueClass?: string }} AbilityHudCell
 * @typedef {Record<"q" | "w" | "e" | "r", AbilityHudCell>} AbilityHudSnapshot
 */

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

/** Push ability labels/values + REFERENCE-style cooldown fill into `game.html` ability bar slots. */
export function syncAbilityBarDocument(doc, hud) {
  for (const slot of ["q", "w", "e", "r"]) {
    const root = doc.querySelector(`[data-ability-slot="${slot}"]`);
    if (!root) continue;
    const cell = hud[slot];
    if (!cell) continue;
    const fillEl = root.querySelector(".ability-fill");
    const labelEl = root.querySelector(".ability-label");
    const valueEl = root.querySelector(".ability-value");
    if (labelEl) labelEl.textContent = cell.label;
    if (valueEl) {
      valueEl.textContent = cell.value;
      valueEl.classList.remove("ability-value--lunatic-w", "ability-value--bulwark-e");
      if (cell.valueClass) valueEl.classList.add(cell.valueClass);
    }

    if (fillEl) {
      const f = cell.fill;
      if (f && f.duration > 1e-4) {
        const cooldownProgress = clamp(1 - f.remaining / f.duration, 0, 1);
        fillEl.style.width = `${Math.round(cooldownProgress * 100)}%`;
        fillEl.style.background = f.color;
        fillEl.style.opacity = String(0.2 + cooldownProgress * 0.75);
        root.style.borderColor = f.color;
      } else {
        fillEl.style.width = "100%";
        fillEl.style.background = "#64748b";
        fillEl.style.opacity = "0.35";
        root.style.borderColor = "#475569";
      }
    }
  }
}
