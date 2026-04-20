import { getHeroRoster } from "../Characters/roster.js";

/**
 * Fills `#character-select-pick` from `getHeroRoster()`. Markup stays agnostic; all copy lives in `roster.js`.
 * @param {Document} doc
 */
export function mountCharacterRoster(doc) {
  const host = doc.getElementById("character-select-pick");
  if (!host) return;

  host.replaceChildren();

  getHeroRoster().forEach((hero, index) => {
    const btn = doc.createElement("button");
    btn.type = "button";
    btn.className = "character-option";
    if (index > 0) btn.style.marginTop = "10px";
    btn.dataset.characterId = hero.id;
    btn.setAttribute("aria-label", hero.title);
    if (!hero.implemented) {
      btn.disabled = true;
      btn.classList.add("character-option--locked");
      btn.title = "Coming soon";
    }

    const title = doc.createElement("span");
    title.className = "title";
    title.textContent = hero.title;

    const meta = doc.createElement("span");
    meta.className = "meta";
    meta.textContent = hero.meta;

    btn.append(title, meta);
    host.append(btn);
  });
}
