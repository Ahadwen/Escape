export function buildCharacterTutorialHtml(id, characters) {
  const k = characters.knight.abilities;
  const r = characters.rogue.abilities;
  const l = characters.lunatic.abilities;
  const v = characters.valiant.abilities;
  if (id === "knight") {
    return `
      <p class="character-detail-lead">The <strong>Knight</strong> is a sturdy all-rounder: forgiving HP and a simple rhythm for learning waves, spacing, and how the arena moves.</p>
      <ul>
        <li><strong>Q — ${k.dash.label}:</strong> quick dart through gaps to slip out of pressure.</li>
        <li><strong>W — ${k.burst.label}:</strong> short speed surge that shoves hunters aside—break chokes or sprint to safety.</li>
        <li><strong>E — ${k.decoy.label}:</strong> drops a lure so hunters fixate elsewhere while you reposition.</li>
      </ul>
      <p class="character-detail-lead" style="margin-top:10px">Pause: Space · Retry: R returns to character select.</p>
    `;
  }
  if (id === "rogue") {
    return `
      <p class="character-detail-lead">The <strong>Hungry Rogue</strong> is always hungry and dies if he is not fed. Chase food across the arena to stay alive.</p>
      <ul>
        <li><strong>Passive:</strong> when you break line of sight on pursuers, you can enter stealth. Hug a wall while stealthed and you can stay hidden even across open sightlines—use corners and cover to slip past danger.</li>
        <li><strong>Q — ${r.dash.label}:</strong> hold to aim a direction, release to snap forward in a quick dash—your main burst of movement to dodge shots, round corners, or close distance.</li>
        <li><strong>W — ${r.burst.label}:</strong> throws a smoke bomb that leaves a lingering cloud—fight inside it or chain it with walls to control where you are visible.</li>
        <li><strong>E — ${r.decoy.label}:</strong> for a short window, on-screen cues point toward nearby food—use it when you are low and need to find the next bite fast.</li>
      </ul>
      <p class="character-detail-lead" style="margin-top:10px">The top-left <strong>Fed</strong> bar and the arcs around your hero show hunger and stealth grace. Pause: Space · Retry: R returns to character select.</p>
    `;
  }
  if (id === "valiant") {
    return `
      <p class="character-detail-lead">The <strong>Valiant</strong> is a guardian robot: your body ignores HP damage, but <strong>Will to live</strong> drains when you are short on companions—fastest with no rabbits, half pace with one, steady with two, and it slowly climbs again when all three slots are filled. <strong>Wild rabbits</strong> appear on the map as pickups—walk over them to tuck one into the first free slot (left, right, back). Each rabbit has a few HP; when one dies, you lose a chunk of Will.</p>
      <ul>
        <li><strong>Q — ${v.dash.label}:</strong> short speed surge (like a classic burst)—pair with Clubs for phase-through terrain while it is active.</li>
        <li><strong>W — ${v.burst.label}:</strong> a large crackling perimeter with heavy corner posts; it only <strong>blocks enemies</strong> (you and projectiles pass through).</li>
        <li><strong>E — ${v.decoy.label}:</strong> sends your <strong>lowest current HP</strong> equipped rabbit to safety, freeing its slot and restoring a large chunk of Will (about 40%; long cooldown). With no rabbits equipped, Rescue stays locked on full cooldown until you have at least one again. Diamonds can add extra Will on use.</li>
        <li><strong>R — ${v.random.label}:</strong> same as other heroes—the <strong>Ace</strong> in your rank deck sets which ultimate you get (shield ring, timelock, push waves, or vitality).</li>
      </ul>
      <p class="character-detail-lead" style="margin-top:10px">Hearts cards split bonus HP across rabbits; Spades face cards grant an extra shock-field charge. Pause: Space · Retry: R returns to character select.</p>
    `;
  }
  if (id === "lunatic") {
    return `
      <p class="character-detail-lead">The <strong>Lunatic</strong> cannot collect cards and does not roll procedural arena specials—only sanctuaries appear. Sanctuaries still offer a level-up, but the inner roulette and forge do not appear. Health crystals raise your <strong>max HP</strong> instead of healing.</p>
      <ul>
        <li><strong>Passive:</strong> slow health regeneration (similar to a hearts set bonus).</li>
        <li><strong>W — ${l.burst.label}:</strong> toggle sprinting charge vs stumbling on foot. Each direction has its own short lockout. Releasing sprint runs a short deceleration whose length scales with how long you were sprinting (none at a tap, up to the full window after about five seconds). Slamming terrain while sprinting stuns you; crash damage scales with sprint time (1 / 2 / 3 for up to two seconds, up to four seconds, then above that) with a clear impact flash.</li>
        <li><strong>Q / E — ${l.dash.label} / ${l.decoy.label}:</strong> while sprinting (or decelerating from a stop), hold to curve — same as <strong>Left / Right arrow</strong>. Turn rate follows a minimum turning circle (tighter at lower speed).</li>
        <li><strong>R — ${l.random.label}:</strong> 30s cooldown, sprint-only: briefly surge faster; terrain you touch is torn away, but staying inside it still ticks heavy damage.</li>
      </ul>
      <p class="character-detail-lead" style="margin-top:10px">Pause: Space · After death, <strong>R</strong> returns to character select.</p>
    `;
  }
  return "";
}
