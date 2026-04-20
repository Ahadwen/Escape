/**
 * Default event runner.
 * Event systems remain source-of-truth; this helper gives character modules
 * consistent override hooks without duplicating per-event dispatch logic.
 */
export function runEventWithCharacterOverrides(eventName, module, ctx, runDefault) {
  const overrides = module?.eventOverrides || {};
  const before = overrides[`before${eventName}Update`];
  const after = overrides[`after${eventName}Update`];
  if (typeof before === "function") before(ctx);
  runDefault();
  if (typeof after === "function") after(ctx);
}
