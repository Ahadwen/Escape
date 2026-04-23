import { getHeroRoster } from "../Characters/roster.js";

/**
 * Populates `#dev-active-hero-select` from roster data and wires `change`.
 * Unimplemented heroes appear as disabled options.
 * @param {Document} doc
 * @param {{ initialId: string, onSelect: (id: string) => void }} opts
 */
export function mountDevActiveHeroSelect(doc, { initialId, onSelect }) {
  const sel = doc.getElementById("dev-active-hero-select");
  if (!(sel instanceof HTMLSelectElement)) {
    return { dispose() {}, setValue() {} };
  }

  sel.replaceChildren();
  for (const h of getHeroRoster()) {
    const opt = doc.createElement("option");
    opt.value = h.id;
    opt.textContent = h.title;
    opt.disabled = !h.implemented;
    sel.append(opt);
  }

  const roster = getHeroRoster();
  const resolved =
    roster.find((h) => h.id === initialId && h.implemented)?.id ??
    roster.find((h) => h.implemented)?.id ??
    "knight";
  sel.value = resolved;

  function setValue(id) {
    if (roster.some((h) => h.id === id && h.implemented)) {
      sel.value = id;
    }
  }

  function onChange() {
    const id = sel.value;
    const hero = roster.find((x) => x.id === id);
    if (!hero?.implemented) return;
    onSelect(id);
    sel.blur();
  }

  sel.addEventListener("change", onChange);
  return {
    setValue,
    dispose() {
      sel.removeEventListener("change", onChange);
    },
  };
}
