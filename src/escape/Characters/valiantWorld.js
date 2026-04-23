import { intersectsRectCircle } from "../Hunters/hunterGeometry.js";
import {
  VALIANT_RABBIT_BASE_HP,
  VALIANT_RESCUE_WILL_RESTORE,
  VALIANT_WILL_RABBIT_DEATH_COST,
  VALIANT_WILL_DECAY_PER_EMPTY_SLOT,
  VALIANT_WILL_REGEN_PER_SEC_THREE_RABBITS,
  VALIANT_SHOCK_BOX_W,
  VALIANT_SHOCK_BOX_H,
  VALIANT_SHOCK_BOX_DURATION_SEC,
  VALIANT_BUNNY_PICKUP_R,
  VALIANT_BUNNY_SPAWN_INTERVAL,
  VALIANT_BUNNY_LIFETIME_SEC,
  VALIANT_DIAMOND_RESCUE_WILL_BONUS,
  VALIANT_DIAMOND_BOX_SCALE,
  SET_BONUS_SUIT_MAX,
  LASER_BLUE_PLAYER_SLOW_SEC,
} from "../balance.js";
import { countSuitsInActiveSlots } from "../items/setBonusPresentation.js";

function distSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function createValiantWorld() {
  /** @type {number} */
  let will = 1;
  /** @type {(null | { hp: number; maxHp: number })[]} */
  let rabbitSlots = [null, null, null];
  let rescueReadyAt = 0;
  let nextBunnyAt = 0;
  /** @type {number[]} */
  let slotBonusMax = [0, 0, 0];
  /** @type {{ x: number; y: number; r: number; bornAt: number; expiresAt: number }[]} */
  let bunnies = [];
  /** @type {{ x: number; y: number; w: number; h: number; expiresAt: number }[]} */
  let electricBoxes = [];
  /**
   * @type {(
   *   | { kind: "rabbitDeath"; x: number; y: number; bornAt: number; expiresAt: number; angles: number[] }
   *   | { kind: "rescue"; x: number; y: number; bornAt: number; expiresAt: number }
   *   | { kind: "bunnySaved"; x: number; y: number; bornAt: number; expiresAt: number }
   * )[]}
   */
  let rabbitFx = [];
  /** REFERENCE healPopups: floating text (e.g. "Saved" on wild bunny pickup). */
  /** @type {{ x: number; y: number; text: string; color: string; fontPx: number; bornAt: number; expiresAt: number }[]} */
  let floatPopups = [];
  const boxChargeState = { charges: 1, maxCharges: 1, nextRechargeAt: 0 };

  function shockBoxScale(inventory) {
    if (!inventory) return 1;
    if (inventory.diamondEmpower === "valiantBox") return VALIANT_DIAMOND_BOX_SCALE;
    const suits = countSuitsInActiveSlots(inventory);
    if (suits.diamonds >= SET_BONUS_SUIT_MAX) return VALIANT_DIAMOND_BOX_SCALE;
    return 1;
  }

  function firstEmptySlot() {
    for (let i = 0; i < 3; i++) if (!rabbitSlots[i]) return i;
    return -1;
  }

  function lowestHpOccupiedSlot() {
    let best = -1;
    let bestHp = Infinity;
    for (let i = 0; i < 3; i++) {
      const s = rabbitSlots[i];
      if (!s || s.hp <= 0) continue;
      if (best < 0 || s.hp < bestHp || (s.hp === bestHp && i < best)) {
        bestHp = s.hp;
        best = i;
      }
    }
    return best;
  }

  function randomOccupiedRabbitIndex() {
    const opts = [];
    for (let i = 0; i < 3; i++) {
      const s = rabbitSlots[i];
      if (s && s.hp > 0) opts.push(i);
    }
    if (!opts.length) return -1;
    return opts[Math.floor(Math.random() * opts.length)];
  }

  function rabbitAnchorWorld(slot, player) {
    const px = player.x;
    const py = player.y;
    const fx = player.facing?.x || 1;
    const fy = player.facing?.y || 0;
    const fl = Math.hypot(fx, fy) || 1;
    const rdx = fx / fl;
    const rdy = fy / fl;
    const lx = -rdy;
    const ly = rdx;
    const spots = [
      { slot: 0, ox: lx * 15 - rdx * 7, oy: ly * 15 - rdy * 7 },
      { slot: 1, ox: -lx * 15 - rdx * 7, oy: -ly * 15 - rdy * 7 },
      { slot: 2, ox: -rdx * 19, oy: -rdy * 19 },
    ];
    const sp = spots.find((s) => s.slot === slot);
    if (!sp) return { x: px, y: py };
    return { x: px + sp.ox, y: py + sp.oy };
  }

  function occupiedRabbitCount() {
    let n = 0;
    for (let i = 0; i < 3; i++) if (rabbitSlots[i]) n += 1;
    return n;
  }

  function willNetChangePerSec() {
    const occ = occupiedRabbitCount();
    const drainAtZeroRabbits = 3 * VALIANT_WILL_DECAY_PER_EMPTY_SLOT;
    if (occ === 0) return -drainAtZeroRabbits;
    if (occ === 1) return -drainAtZeroRabbits / 2;
    if (occ === 2) return 0;
    return VALIANT_WILL_REGEN_PER_SEC_THREE_RABBITS;
  }

  function getWillNetChangePerSec() {
    return willNetChangePerSec();
  }

  function triggerDeathFromWill(hooks) {
    will = 0;
    hooks?.onWillDeath?.();
  }

  /**
   * @param {number} amount
   * @param {object} opts
   * @param {boolean} [opts.surgeHexPulse]
   * @param {boolean} [opts.laserBlueSlow]
   * @param {*} rt — runtime hooks (`getSimElapsed`, `getPlayer`, `combat`, stun/shake/kill callbacks)
   */
  function applyDamage(amount, opts, rt) {
    if (amount <= 0) return;
    const elapsed = rt.getSimElapsed();
    const dmg = opts.surgeHexPulse ? 1 : amount;
    const idx = opts.surgeHexPulse ? lowestHpOccupiedSlot() : randomOccupiedRabbitIndex();
    if (idx < 0) return;
    const slot = rabbitSlots[idx];
    if (!slot) return;
    slot.hp -= dmg;
    if (opts.laserBlueSlow) {
      rt.combat.playerLaserSlowUntil = elapsed + LASER_BLUE_PLAYER_SLOW_SEC;
    }
    rt.combat.hurtFlashRemain = 0.16;
    rt.combat.playerInvulnerableUntil = elapsed + 0.35;
    rt.combat.screenShakeUntil = elapsed + 0.18;
    rt.combat.screenShakeStrength = Math.max(rt.combat.screenShakeStrength ?? 0, 8);
    rt.bumpScreenShake?.(8, 0.18);
    rt.grantInvulnerabilityUntil?.(elapsed + 0.35);

    const stunSecs = rt.getPlayer().stunOnHitSecs ?? 0;
    if (stunSecs > 0) rt.stunNearbyEnemies?.(stunSecs);

    if (slot.hp <= 0) {
      const { x: dax, y: day } = rabbitAnchorWorld(idx, rt.getPlayer());
      rabbitSlots[idx] = null;
      will = Math.max(0, will - VALIANT_WILL_RABBIT_DEATH_COST);
      rabbitFx.push({
        kind: "rabbitDeath",
        x: dax,
        y: day,
        angles: Array.from({ length: 11 }, (_, i) => (i / 11) * Math.PI * 2 + (Math.random() * 2 - 1) * 0.22),
        bornAt: elapsed,
        expiresAt: elapsed + 0.52,
      });
      rt.bumpScreenShake?.(16, 0.26);
      if (will <= 0) triggerDeathFromWill({ onWillDeath: rt.onWillDeath });
    }
  }

  function collidesEnemyShockField(circle, elapsed) {
    for (const box of electricBoxes) {
      if (elapsed >= box.expiresAt) continue;
      if (intersectsRectCircle(circle, box)) return true;
    }
    return false;
  }

  /**
   * @param {number} elapsed
   * @param {number} effectiveBurstCd — `effectiveCooldown` for shock (W) ability
   * @returns {boolean}
   */
  function tryConsumeShockCharge(elapsed, effectiveBurstCd) {
    const st = boxChargeState;
    if (st.charges <= 0) return false;
    st.charges -= 1;
    if (st.charges < st.maxCharges) {
      st.nextRechargeAt = Math.max(st.nextRechargeAt || 0, elapsed + effectiveBurstCd);
    }
    return true;
  }

  function placeShockField(player, inventory, elapsed, spawnAttackRing) {
    const scale = shockBoxScale(inventory);
    const w = VALIANT_SHOCK_BOX_W * scale;
    const h = VALIANT_SHOCK_BOX_H * scale;
    const cx = player.x;
    const cy = player.y;
    electricBoxes.push({
      x: cx - w / 2,
      y: cy - h / 2,
      w,
      h,
      expiresAt: elapsed + VALIANT_SHOCK_BOX_DURATION_SEC,
    });
    spawnAttackRing?.(cx, cy, Math.max(w, h) * 0.55, "#38bdf8", 0.28);
    spawnAttackRing?.(cx, cy, Math.max(w, h) * 0.38, "#bae6fd", 0.22);
  }

  function tryRescue(elapsed, inventory, player, effectiveRescueCd, spawnAttackRing) {
    if (elapsed < rescueReadyAt) return;
    const slot = lowestHpOccupiedSlot();
    if (slot < 0) return;
    const anchor = rabbitAnchorWorld(slot, player);
    rabbitSlots[slot] = null;
    rescueReadyAt = elapsed + effectiveRescueCd;
    let willBump = VALIANT_RESCUE_WILL_RESTORE;
    if (inventory.diamondEmpower === "valiantRescue" || countSuitsInActiveSlots(inventory).diamonds >= SET_BONUS_SUIT_MAX) {
      willBump += VALIANT_DIAMOND_RESCUE_WILL_BONUS;
    }
    will = Math.min(1, will + willBump);
    rabbitFx.push({
      kind: "rescue",
      x: anchor.x,
      y: anchor.y,
      bornAt: elapsed,
      expiresAt: elapsed + 0.92,
    });
    spawnAttackRing?.(player.x, player.y, player.r + 24, "#818cf8", 0.25);
  }

  function startRescueCooldownFromNow(elapsed, effectiveRescueCd) {
    rescueReadyAt = elapsed + effectiveRescueCd;
  }

  function tickExpireEntities(elapsed) {
    for (let i = electricBoxes.length - 1; i >= 0; i--) {
      if (elapsed >= electricBoxes[i].expiresAt) electricBoxes.splice(i, 1);
    }
    for (let i = rabbitFx.length - 1; i >= 0; i--) {
      if (elapsed >= rabbitFx[i].expiresAt) rabbitFx.splice(i, 1);
    }
    for (let i = bunnies.length - 1; i >= 0; i--) {
      if (elapsed >= bunnies[i].expiresAt) bunnies.splice(i, 1);
    }
    for (let i = floatPopups.length - 1; i >= 0; i--) {
      if (elapsed >= floatPopups[i].expiresAt) floatPopups.splice(i, 1);
    }
  }

  /**
   * REFERENCE `spawnHealPopup` for Valiant bunny rescue line.
   * @param {{ x: number; y: number; r: number }} player
   * @param {number} elapsed
   */
  function spawnBunnySavedPopup(player, elapsed) {
    floatPopups.push({
      x: player.x,
      y: player.y - player.r - 10,
      text: "Saved",
      color: "#86efac",
      fontPx: 13,
      bornAt: elapsed,
      expiresAt: elapsed + 0.65,
    });
  }

  function tryPickupBunnies(player, elapsed) {
    for (let i = bunnies.length - 1; i >= 0; i--) {
      const b = bunnies[i];
      if (elapsed >= b.expiresAt) {
        bunnies.splice(i, 1);
        continue;
      }
      const slot = firstEmptySlot();
      if (slot < 0) continue;
      const rr = b.r + player.r;
      if (distSq(b, player) <= rr * rr) {
        const bonus = slotBonusMax[slot] ?? 0;
        rabbitSlots[slot] = { hp: VALIANT_RABBIT_BASE_HP + bonus, maxHp: VALIANT_RABBIT_BASE_HP + bonus };
        /** REFERENCE `drawValiantRabbitFx` rescue sequence at pickup site (beam + rabbit zoom-away). */
        rabbitFx.push({
          kind: "bunnySaved",
          x: b.x,
          y: b.y,
          bornAt: elapsed,
          expiresAt: elapsed + 0.92,
        });
        bunnies.splice(i, 1);
        spawnBunnySavedPopup(player, elapsed);
      }
    }
  }

  /**
   * @param {number} simDt
   * @param {{ onWillDeath?: () => void }} [hooks]
   */
  function tickWillDecay(simDt, hooks) {
    const netPerSec = willNetChangePerSec();
    will += netPerSec * simDt;
    will = Math.min(1, will);
    if (will <= 0) {
      will = 0;
      triggerDeathFromWill(hooks);
    }
  }

  function updateRescueCooldownWhenNoRabbits(elapsed, effectiveRescueCd) {
    if (occupiedRabbitCount() === 0) startRescueCooldownFromNow(elapsed, effectiveRescueCd);
  }

  function tickBoxRecharge(elapsed) {
    if (boxChargeState.charges < boxChargeState.maxCharges && boxChargeState.nextRechargeAt > 0 && elapsed >= boxChargeState.nextRechargeAt) {
      boxChargeState.charges = boxChargeState.maxCharges;
      boxChargeState.nextRechargeAt = 0;
    }
  }

  function syncBoxMaxCharges(maxCharges) {
    boxChargeState.maxCharges = Math.max(1, maxCharges);
    boxChargeState.charges = Math.min(boxChargeState.charges || boxChargeState.maxCharges, boxChargeState.maxCharges);
  }

  function trySpawnWildBunny(elapsed, randomPointFn, lootScale = 1) {
    if (elapsed < nextBunnyAt) return;
    const pt = randomPointFn();
    if (!pt) return;
    nextBunnyAt = elapsed + (VALIANT_BUNNY_SPAWN_INTERVAL + (Math.random() * 2 - 1) * 1.1 + Math.random() * 1.3) * lootScale;
    bunnies.push({
      x: pt.x,
      y: pt.y,
      r: VALIANT_BUNNY_PICKUP_R,
      bornAt: elapsed,
      expiresAt: elapsed + VALIANT_BUNNY_LIFETIME_SEC,
    });
  }

  function healInjuredRabbitFromCrystal(healAmt) {
    const hurt = [];
    for (let j = 0; j < 3; j++) {
      const s = rabbitSlots[j];
      if (s && s.hp < s.maxHp) hurt.push(j);
    }
    if (!hurt.length) return false;
    const ri = hurt[Math.floor(Math.random() * hurt.length)];
    const rb = rabbitSlots[ri];
    if (!rb) return false;
    rb.hp = Math.min(rb.maxHp, rb.hp + healAmt);
    return true;
  }

  function applySafehouseFullHeal() {
    will = 1;
    for (let i = 0; i < 3; i++) {
      const s = rabbitSlots[i];
      if (s) {
        s.hp = s.maxHp;
      }
    }
  }

  function reset(elapsed) {
    will = 1;
    rabbitSlots = [null, null, null];
    rescueReadyAt = 0;
    nextBunnyAt = elapsed + 5;
    slotBonusMax = [0, 0, 0];
    bunnies.length = 0;
    electricBoxes.length = 0;
    rabbitFx.length = 0;
    floatPopups.length = 0;
    boxChargeState.charges = 1;
    boxChargeState.maxCharges = 1;
    boxChargeState.nextRechargeAt = 0;
  }

  return {
    reset,
    getWill: () => will,
    setSlotBonusMax(arr) {
      slotBonusMax = arr;
      for (let i = 0; i < 3; i++) {
        const s = rabbitSlots[i];
        if (s) {
          s.maxHp = VALIANT_RABBIT_BASE_HP + (arr[i] ?? 0);
          s.hp = Math.min(s.hp, s.maxHp);
        }
      }
    },
    getSlotBonusMax: () => slotBonusMax.slice(),
    getRabbitSlots: () => rabbitSlots,
    getBunnies: () => bunnies,
    getElectricBoxes: () => electricBoxes,
    getRabbitFx: () => rabbitFx,
    getFloatPopups: () => floatPopups,
    getBoxChargeState: () => boxChargeState,
    getRescueReadyAt: () => rescueReadyAt,
    setRescueReadyAt: (t) => {
      rescueReadyAt = t;
    },
    getNextBunnyAt: () => nextBunnyAt,
    setNextBunnyAt: (t) => {
      nextBunnyAt = t;
    },
    rabbitAnchorWorld,
    applyDamage,
    collidesEnemyShockField,
    placeShockField,
    tryConsumeShockCharge,
    tryRescue,
    tickExpireEntities,
    tryPickupBunnies,
    tickWillDecay,
    updateRescueCooldownWhenNoRabbits,
    tickBoxRecharge,
    syncBoxMaxCharges,
    trySpawnWildBunny,
    healInjuredRabbitFromCrystal,
    applySafehouseFullHeal,
    shockBoxScale,
    startRescueCooldownFromNow,
    occupiedRabbitCount,
    getWillNetChangePerSec,
  };
}
