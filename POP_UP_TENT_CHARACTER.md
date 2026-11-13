# The Giant Pop-Up Tent — Character Sheet

**Film:** Angry Stickman: The Giant Pop-Up Tent (`pop-up-tent`)
**Format:** 1080 × 1920 (9:16), 24 fps, 30 seconds, sound effects only, no dialogue
**Character:** the Angry Stickman — one character, five scenes, one locked design
**Source of truth:** `src/animation/popUpTentRenderer.ts` (drawing + performance) and `src/constants/popUpTentConstants.ts` (brief)

---

## 1. In one sentence

A short-tempered stickman in a red beanie and yellow tee — round white head, two vertical black oval eyes, thick brows, one mouth, thin black limbs and white mitten hands — who keeps the exact same proportions, colours and outfit in every scene until the tiny tent knocks his beanie off at 28.3 s.

---

## 2. Locked rules

**Must have**

- Round white head with a thick black outline (140 px diameter).
- Two small **vertical** black oval eyes.
- Two thick black eyebrows, expressive but always separate strokes.
- One simple black mouth; no lip-sync, pantomime only.
- Bright red knitted beanie: rounded top, clearly visible folded lower edge, pom on top.
- Plain bright yellow short-sleeved T-shirt.
- Thin black stick arms and legs of constant thickness.
- Small white rounded **mitten** hands with black outlines.
- Blue trousers, small rounded solid-black shoes.
- Identical proportions, colours and outfit in all five scenes.

**Must never have**

- No nose, ears, hair, freckles, blush, tongue or glasses.
- No second stickman, crowd, or background double.
- No black gloves and no five-finger hands — the hands stay white mittens.
- No outfit swap, colour drift, height change or age change.
- No dialogue, captions spoken by the character, or lip-sync.
- No gore. The comedy is harmless and family-friendly.

The only sanctioned design change in the whole film: **the beanie comes off at 28.3 s** and stays off.

---

## 3. Palette

| Hex | Symbol | Used for |
| --- | --- | --- |
| `#17121f` | `INK` | All outlines, stick limbs, eyes, brows, mouth, shoes |
| `#ffffff` | `WHITE` | Head, mitten hands, the tooth strip in the big smile |
| `#e63946` | `BEANIE` | Beanie dome |
| `#b3222e` | `BEANIE_DEEP` | Folded beanie band |
| `#ff6b6b` | `BEANIE_POM` | Pom-pom |
| `#f07178` | — | Five vertical beanie stitches |
| `#ffd166` | `SHIRT` | T-shirt body and sleeves |
| `#e8b23f` | `SHIRT_DEEP` | Collar line, sleeve cuffs, shirt folds |
| `#2f5fa8` | `TROUSER` | Trousers |
| `#141414` | `SHOE` | Shoes |
| `#ffffff` + `#17121f` | hand renderer | Mitten fill + outline (`STROKE = 4.5`, doubled for the silhouette pass) |

The background is deliberately warm and colourful (cream wallpaper, wood floor, orange/turquoise/yellow tent), so the character's red/yellow/blue triad always separates from it.

---

## 4. Proportions and rig geometry

| Part | Measurement |
| --- | --- |
| Canvas | 1080 × 1920 |
| Floor line | `FLOOR_Y = 1500` |
| Standing height | 630 px floor → crown |
| Head | Circle, radius `HEAD_R = 70` (140 px diameter), 5 px ink outline |
| Head centre | 90 px above the shoulder line; head bottom sits 20 px above the shoulders |
| Neck | 14 px black stroke, from shoulder +8 to shoulder −20 |
| Torso | Trapezoid, 170 px tall: 72 px at the hips (±36) widening to 80 px at the shoulders (±40) |
| Shoulder sockets | `bodyTopX ± 36`, at `shoulderY` |
| Arms | Upper 118 px + lower 118 px, 15 px black stroke |
| Sleeves | 36 px long over the upper arm, 38 px ink / 29 px yellow, cuff line at 34 px |
| Legs | Trousers hip → knee (34 px ink / 25 px blue), shin knee → ankle (15 px ink) |
| Knees | `hipY + 86` standing, splayed ±64 when seated |
| Ankles | `baseY − 16`, ±40 standing, ±118 seated |
| Shoes | 68 × 26 rounded rect, radius 11, drawn at ankle +12 |
| Contact shadow | 78 × 15 ellipse at `ground + 8`, 16% ink; skipped when airborne or seated |
| Hip height | `baseY − (300 − 150·crouch − 170·sit)` |

The "big head" read comes from the 80 px shoulders and 15 px limbs, not from a literal 40% head. The head is about 22% of the standing height, but it is almost twice as wide as the shoulders and more than nine times thicker than an arm, so it dominates the silhouette.

**Lean:** the torso top shifts by `sin(lean) × 170` while the hips stay planted; the head follows the torso, so a lean reads as a whole-body hinge.

**Head turn:** `headTurn` shifts the **face features**, not the skull, by a few pixels (default 3 px). That is the subtle 3/4 look; the head outline itself only tilts via `headTilt`.

---

## 5. Face system

### Eyes

Vertical black ovals, never dots and never circles.

| Shape | Size | Notes |
| --- | --- | --- |
| `open` (default) | 20 × 22 | Centres at ±26 from face centre, `y = 8` |
| `wide` | 20 × 34 | Shock, launch, bonk |
| `squint` | 20 × 9 | Anger, effort, the final stare |
| `shut` | 28 × 14 arc | Dizzy / knocked out |
| `happy` | 28 × 14 arc | Proud smile, victory |

- `look` shifts both eyes ±7 px vertically (`down`/`up`) or horizontally (`left`/`right`).
- The mouth and brows shift with the same face offset, so the whole expression stays aligned.
- Eyes never leave the head, never glow, never get whites or pupils.

### Brows

9 px thick, round caps, from ±42 to ±12, baseline `y = −12`.

| Shape | Read |
| --- | --- |
| `normal` | Relaxed, slight inner lift |
| `raised` | Surprise, curiosity |
| `angry` | Outer ends up, inner ends down — the signature Angry Stickman scowl |
| `determined` | Same geometry as angry, used for effort |
| `sad` | Outer ends down, inner ends up — worry |
| `cocky` | One flat brow, one tilted — smug |
| `uneven` | One high, one low — confusion / dizziness |

### Mouth

6 px stroke, baseline `y = 40`.

| Shape | Read |
| --- | --- |
| `flat` | Deadpan, annoyance |
| `smile` | Default friendly curve |
| `grin` | Wider, cheekier curve |
| `bigsmile` | Filled open smile with a white tooth strip |
| `smirk` | Lopsided curl |
| `o` | Shock, effort, the pop |
| `frown` | Sadness |
| `grit` | Clenched teeth — pushing, pulling, pressing |

---

## 6. Beanie construction

Drawn in head-local space, so it inherits `headTilt` and `headDrop`:

1. **Dome** — arc of radius 75 centred at `(0, −24)`, from 1.02π to 1.98π (the top half), filled `BEANIE`, 5 px ink.
2. **Folded band** — 150 × 20 rect from `y = −44` to `−24`, filled `BEANIE_DEEP`, same outline. This is the "clearly visible folded lower edge".
3. **Stitches** — five 3 px `#f07178` lines at `x = −46, −23, 0, 23, 46`, from `y = −70` to `−50`.
4. **Pom** — 16 px radius circle at `(0, −103)`, filled `BEANIE_POM`, 4 px ink.

The knocked-off beanie is the same `drawBeanieShape` routine drawn in world space: it flips from the head at 28.25 s, travels to roughly `(770, 1080)` by 29.2 s, rotates 2.2 rad, scales to 0.88 and snags on the lamp shade, staying in frame for the final stare.

---

## 7. Outfit and hands

- **Torso:** yellow trapezoid, 5 px ink outline, a 3 px `SHIRT_DEEP` collar line 13 px below the shoulder line.
- **Sleeves:** yellow capsule over the top 36 px of each upper arm, 38 px ink underlay / 29 px yellow fill, plus a cuff cross-line in `SHIRT_DEEP`. Sleeves are drawn **after** the bare arms so the black arm reads as continuing out of the cuff.
- **Trousers:** blue capsule from hip to knee over a wider ink underlay; the shin below the knee is bare black stick.
- **Shoes:** solid `#141414` rounded rect with a small white highlight; seated poses rotate the shoes outward (±0.45 rad) so the splayed legs read from the front.
- **Hands:** `drawHand` from `src/animation/handRenderer.ts` — a seamless white mitten silhouette (palm + thumb + wrapped finger bumps) with a 4.5 px ink outline. The renderer uses `relaxed`, `grip` and `fist`; grip is used on the package, the pole and the release button.

---

## 8. Rig controls (`Pose`)

| Field | Range / type | What it does |
| --- | --- | --- |
| `lean` | radians, typically −0.32…0.4 | Hinges the torso (and head) from the hips |
| `hipDrop` | px | Lowers the hips and bends the knees |
| `crouch` | 0…1 | Full crouch blend (hips down 150 px, knees out) |
| `sit` | 0…1 | Seated blend (hips down 170 px, knees splayed ±64, ankles ±118) |
| `headTilt` | radians | Rotates the whole head, beanie included |
| `headDrop` | px | Drops the head on the neck — used for the package bonk |
| `headTurn` | px | Shifts the face features left/right |
| `look` | `front` / `down` / `up` / `left` / `right` | Eye and face offset |
| `eye` | `open` / `wide` / `squint` / `shut` / `happy` | Eye shape |
| `brow` | `normal` / `angry` / `raised` / `sad` / `cocky` / `determined` / `uneven` | Brow shape |
| `mouth` | `flat` / `smile` / `grin` / `bigsmile` / `smirk` / `o` / `frown` / `grit` | Mouth shape |
| `stance` | px | Widens/narrows the standing feet |
| `footLift` | px | Lifts the right foot (step) |
| `handL`, `handR` | absolute canvas points | Hand IK targets |
| `bendL`, `bendR` | ±1 | Chooses the elbow solution |
| `gripL`, `gripR` | boolean | Mitten grip pose |
| `fistL`, `fistR` | boolean | Mitten fist pose |
| `beanieOn` | boolean | Draws the beanie on the head |

Pose keys are authored in `POSE_PATCHES` and merged cumulatively by `buildPoseKeys()`, then blended with a smoothstep in `poseAt(t)`. Discrete fields (eyes, brows, mouth, look, booleans) switch at the halfway point of a blend; continuous fields (lean, crouch, hands, tilt) interpolate.

---

## 9. Arm solver

The arms are not hand-placed: they are a two-bone IK solve from the shoulder to an absolute hand target.

- Shoulder sockets sit at `bodyTopX ± 36`, `shoulderY`.
- Both segments are 118 px, so the maximum reach is 236 px from the shoulder.
- The hand target is clamped to **96 px from the head centre** (`HEAD_R + 26`), so a hand can never cover the face.
- The elbow picks between the two valid solutions using `distance(elbow, head) + 0.35 × side × (elbow.x − shoulder.x)` — it prefers the solution farther from the head and biased outward.
- The elbow is then clamped to **100 px from the head centre** (`HEAD_R + 30`), so the forearm never cuts across the face either.
- `bendL` / `bendR` flips the preferred solution for raised, overhead or crossed poses.

Draw order inside `drawCharacter`: shadow → legs → shoes → torso → neck → arms → sleeves → hands → head. The head is drawn last so it always sits cleanly over the shoulders and any hand that comes near it.

---

## 10. Performance timeline

| Time | Beat | Position | Face / body | Hands |
| --- | --- | --- | --- | --- |
| 0.0–0.9 | Notices the tiny package | x 420 | `o` mouth, raised brow, look right | Low, relaxed |
| 0.9–1.7 | Walks over | 420 → 520 | Neutral, look down | Swinging |
| 2.4 | Crouches to pick it up | x 520, crouch 0.75 | `flat`, determined | Both grip the package |
| 2.6–3.2 | Lifts it | Package rises to (540, 1150) | `smile`, look down | Both hands follow |
| 3.6 | Proud hold | x 520 | `bigsmile`, `happy` eyes, raised brow | Both grip, chest height |
| 4.1–4.55 | Winds up, then snaps forward | x 520, lean −0.1 → 0.16 | `grit`, determined | Package at (540, 1250) |
| 4.65–5.0 | Throws it down | x 520, lean 0.26 | `o`, wide eyes | Hands fling to (556, 1330) / (660, 1340) |
| 5.1–5.95 | Deadpan stare at the package | x 520 | `flat`, sad brow, look down | Hanging |
| 6.0 | The tent pops | x 520 | `o`, wide, raised brow | Low, jolted |
| 6.05–6.55 | Leaps away | 520 → 300, 92 px hop | `o`, wide | Both up |
| 6.55–12.0 | Watches it grow | x 300 | Wide/sad alternating, lean back | Half-raised |
| 12.0–12.7 | Backs to the wall | 300 → 220 | `o`, wide, look up | Raised |
| 12.75–15.9 | **Off-camera** (exterior house shot) | — | — | — |
| 15.9 | Hard cut back inside | x 520 | Neutral | Low |
| 16.35 | The pole slides | x 520 | `o`, wide | Reaching |
| 16.7–17.5 | Grabs and is dragged | 520 → 820, lean 0.16 → 0.4 | `grit`, determined, then `o` | Both pinned to the pole, `grip` |
| 17.9 | Stumbles free | x 820 | `o`, sad brow, wide | Flailing |
| 18.0–18.55 | Faces the giant canopy | x 380 | Neutral → `o`, wide | Low → reaching up |
| 19.0–19.55 | Pushes the fabric | x 380, crouch 0.34 → 0.4 | `grit`, determined, squint | Both hands overhead |
| 19.95–20.2 | The snap-back | x 380 → airborne, lean −0.32 | `o`, wide | Thrown up |
| 20.55–20.8 | Lands on the sleeping bag | x 780, ground 1490, `sit` 1 | `o`, wide | Out for balance |
| 21.15–24.0 | Dizzy sit | x 780 | `shut`/`squint`, sad brow, flat mouth | Loose |
| 24.2–24.9 | Gets off the bag | 780 → 450, ground back to 1500 | `flat` → `o`, wide | Pushing up |
| 25.25–25.55 | Crouches and jumps for the button | x 450, lift 95 | `grit`, determined, squint | Both reach up |
| 25.9 | Presses the button | x 450, lift 95 | `grit`, determined | Both on the button |
| 26.1–26.45 | The tent collapses | x 450, falling | `o`, wide | Up |
| 26.75 | Lands | x 450, crouch 0.4 | `o`, wide | Out |
| 27.05 | Stands up | 450 → 540 | `flat`, normal | Low |
| 27.5–28.05 | Proud pose | x 540 | `bigsmile`, `happy`, raised brow | Fists at the hips |
| 28.3 | Package bonks his head | x 540, `headDrop` 12 | `o`, wide, beanie off | Jolt out |
| 28.6–30.0 | Annoyed stare at camera | x 540 | `flat`, **angry** brow, **squint**, no beanie | Hanging still |

---

## 11. Continuity rules

- **One character only.** No second stickman, no crowd, no shadow character.
- **Beanie on** from 0.0 s to 28.25 s; **beanie off** from 28.3 s to the end. Never put it back on.
- **Same rig** in every scene: 630 px standing height, 140 px head, 118 + 118 px arms, 15 px limbs. No per-scene scaling of the character (camera zoom is separate).
- **Same palette** in every scene. The shirt never turns orange, the trousers never turn black.
- **Eyes are vertical ovals**, never round dots. Brows are separate strokes, never joined to the eyes.
- **White mittens**, never black gloves or separated fingers.
- **The face stays readable:** hand and elbow clamps keep limbs 96/100 px away from the head centre.
- **No dialogue.** The mouth is pantomime; the only audio is the procedural score and SFX.
- **The character is not drawn during 12.75–15.9 s** (the exterior house shot). He is back on the interior cut at 15.9 s at x 520.
- **No gore, no injuries.** The bonk is cartoon slapstick; the beanie takes the hit.

---

## 12. Implementation map

| What | Where |
| --- | --- |
| Brief and locked character text | `src/constants/popUpTentConstants.ts` → `POP_UP_TENT_PROMPT` |
| Palette and `HEAD_R` / `FLOOR_Y` | `src/animation/popUpTentRenderer.ts`, top of file |
| Pose keyframes | `POSE_PATCHES` |
| Cumulative pose build | `buildPoseKeys()` → `POSE_KEYS` |
| Blocking (x, ground, lift) | `charAt(t)` |
| Pose blending | `poseAt(t)` |
| Character entry point | `drawCharacter(t)` |
| Head placement | `headPoint(pose, x, hipY)` |
| Body, legs, torso, arms, hands | `drawBody(...)` |
| Shoe | `drawShoe(...)` |
| Sleeve + cuff | `drawSleeve(...)` |
| Two-bone arm IK | `computeArms(...)` |
| Head, eyes, brows, mouth | `drawHead(...)` |
| Beanie | `drawBeanieShape(...)` |
| Knocked-off beanie | `drawFlyingBeanie(t)` |
| Mitten hand | `drawHand(...)` in `src/animation/handRenderer.ts` |
| Preview / export wiring | `src/components/PlayerView.tsx`, `src/utils/exportVideo.ts` |

To retime a performance beat, add or edit a `POSE_PATCHES` entry (time + partial pose) and, if the body needs to move, adjust `charAt`. Do not hand-place elbows or hands in canvas coordinates outside the IK targets — the solver keeps the face clear automatically.

---

## 13. QA checklist

- [ ] Same character in all five scenes; no second stickman.
- [ ] Round white head, 5 px ink outline, no nose/ears/hair.
- [ ] Two vertical black oval eyes; brows and mouth match the beat.
- [ ] Red beanie with folded band, five stitches and pom until 28.25 s.
- [ ] Yellow tee with collar line and cuffs; blue trousers; black shoes.
- [ ] White mitten hands; no black gloves, no visible fingers.
- [ ] Hands and elbows never cover the face.
- [ ] Beanie flies off at 28.3 s and lands on the lamp shade.
- [ ] Final frame: angry squint straight at camera, no beanie.
- [ ] No dialogue, no extra characters, no gore.
