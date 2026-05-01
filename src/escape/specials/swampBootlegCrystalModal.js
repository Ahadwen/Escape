/**
 * DOM modal: swamp bootleg health crystal — flavour + two choices (no Escape dismiss).
 */

/**
 * @param {object} opts
 * @param {(paused: boolean) => void} [opts.onPausedChange]
 */
export function createSwampBootlegCrystalModal(opts) {
  const onPausedChange = opts.onPausedChange ?? (() => {});
  const root = document.getElementById("swamp-bootleg-crystal-modal");
  const flavorEl = document.getElementById("swamp-bootleg-flavor");
  const btnA = document.getElementById("swamp-bootleg-choice-a");
  const btnB = document.getElementById("swamp-bootleg-choice-b");

  let open = false;
  /** @type {null | ((choice: 'a' | 'b') => void)} */
  let resolvePick = null;

  function setHidden(hidden) {
    if (!root) return;
    root.hidden = hidden;
    root.setAttribute("aria-hidden", hidden ? "true" : "false");
  }

  function close() {
    const needUnpause = open || resolvePick != null;
    open = false;
    resolvePick = null;
    setHidden(true);
    if (needUnpause) onPausedChange(false);
  }

  /**
   * @param {object} payload
   * @param {string} payload.flavor
   * @param {import('../swamp/swampBootlegCrystalPool.js').BootlegOffer} payload.left
   * @param {import('../swamp/swampBootlegCrystalPool.js').BootlegOffer} payload.right
   * @returns {Promise<'a' | 'b'>}
   */
  function openModal(payload) {
    if (!root || !flavorEl || !btnA || !btnB) {
      return Promise.resolve("a");
    }
    open = true;
    setHidden(false);
    onPausedChange(true);
    flavorEl.textContent = payload.flavor;
    btnA.innerHTML = formatChoiceHtml(payload.left);
    btnB.innerHTML = formatChoiceHtml(payload.right);
    return new Promise((resolve) => {
      resolvePick = resolve;
    });
  }

  /** @param {import('../swamp/swampBootlegCrystalPool.js').BootlegOffer} offer */
  function formatChoiceHtml(offer) {
    return `<span class="swamp-bootleg-choice__title">${escapeHtml(offer.title)}</span><span class="swamp-bootleg-choice__body">${offer.bodyLines.map(escapeHtml).join("<br/>")}</span>`;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function onChoose(side) {
    if (!open || !resolvePick) return;
    const res = resolvePick;
    resolvePick = null;
    open = false;
    setHidden(true);
    onPausedChange(false);
    res(side);
  }

  if (btnA) btnA.addEventListener("click", () => onChoose("a"));
  if (btnB) btnB.addEventListener("click", () => onChoose("b"));

  return {
    openModal,
    close,
    isPaused: () => open,
  };
}
