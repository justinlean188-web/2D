import type { StudioConfig } from '../types';
import { drawHand } from './handRenderer';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

// --- Locked Character Palette (Angry Stickman Rig) -------------------------
const INK = '#17121f';
const WHITE = '#ffffff';

const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const BEANIE_POM = '#ff6b6b';
const SHIRT = '#ffd166';
const SHIRT_DEEP = '#e8b23f';
const TROUSER = '#2f5fa8';
const SHOE = '#141414';

// --- Modern Pop 2D Yo-Yo Arena Palette -------------------------------------
const WALL_BG = '#f8fafc';
const WALL_BAND = '#e2e8f0';
const FLOOR_WOOD = '#fde68a';
const FLOOR_ALT = '#fcd34d';
const FLOOR_BORDER = '#b45309';

const YOYO_RED = '#ef4444';
const YOYO_RED_DEEP = '#b91c1c';
const YOYO_BLUE = '#2563eb';
const YOYO_BLUE_DEEP = '#1d4ed8';

const BALL_ORANGE = '#f97316';
const BALL_DEEP = '#c2410c';
const BALL_GLOW = '#fed7aa';

const CUP_GOLD = '#facc15';
const CUP_GOLD_DEEP = '#ca8a04';
const CUP_RIM = '#fef08a';
const PEDESTAL_COLOR = '#64748b';
const PEDESTAL_TOP = '#94a3b8';

const FLOOR_Y = 1520;
const HEAD_R = 70;
const YOYO_R = 62;
const BALL_R = 20;

const PULLEY_POS = { x: 540, y: 230 };
const CUP_POS = { x: 895, y: 1278 };
const PEDESTAL_RECT = { x: 830, y: 1318, w: 130, h: FLOOR_Y - 1318 };

const HOOPS = [
  { id: 0, x: 390, y: 955, r: 104, color: '#06b6d4', inner: '#67e8f9', passT1: 15.1, passT2: 20.15 },
  { id: 1, x: 555, y: 1025, r: 104, color: '#a855f7', inner: '#d8b4fe', passT1: 15.8, passT2: 20.8 },
  { id: 2, x: 720, y: 950, r: 104, color: '#10b981', inner: '#6ee7b7', passT1: 16.5, passT2: 21.45 },
];

// --- Deterministic Math Helpers --------------------------------------------
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const inv = (a: number, b: number, v: number) => clamp((v - a) / (b - a), 0, 1);
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const easeIn = (u: number) => u * u * u;
const easeInOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

const quadBez = (p0: number, p1: number, p2: number, u: number) =>
  (1 - u) * (1 - u) * p0 + 2 * (1 - u) * u * p1 + u * u * p2;

type Pt = { x: number; y: number };
type Look = 'center' | 'right' | 'left' | 'up' | 'down';
type Mouth = 'flat' | 'smile' | 'grin' | 'bigsmile' | 'smirk' | 'frown' | 'o' | 'grit';
type Brow = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'uneven' | 'determined';
type Eye = 'open' | 'wide' | 'squint' | 'shut' | 'happy';

interface Pose {
  lean: number;
  hipDrop: number;
  crouch: number;
  bodySpin: number; // angle around waist when pulled up as human yo-yo
  headTilt: number;
  headTurn: number;
  headDrop: number;
  beanieOn: boolean;
  look: Look;
  mouth: Mouth;
  brow: Brow;
  eye: Eye;
  stance: number;
  footLift: number;
  handL: Pt;
  handR: Pt;
  bendL: 1 | -1;
  bendR: 1 | -1;
  pointL?: boolean;
  pointR?: boolean;
  fistL?: boolean;
  fistR?: boolean;
  gripL?: boolean;
  gripR?: boolean;
}

const BASE_POSE: Pose = {
  lean: 0.04,
  hipDrop: 0,
  crouch: 0,
  bodySpin: 0,
  headTilt: 0,
  headTurn: 2,
  headDrop: 0,
  beanieOn: true,
  look: 'right',
  mouth: 'smirk',
  brow: 'determined',
  eye: 'open',
  stance: 14,
  footLift: 0,
  handL: { x: -64, y: 1205 },
  handR: { x: 82, y: 1180 },
  bendL: -1,
  bendR: 1,
};

const POSE_PATCHES: { t: number; p: Partial<Pose> }[] = [
  // Scene 1: Discovers giant yo-yo, lifts it, drops & pulls -> hits forehead!
  { t: 0.0, p: { look: 'down', mouth: 'o', brow: 'raised', eye: 'wide', handL: { x: -64, y: 1190 }, handR: { x: 82, y: 1185 }, gripR: true } },
  { t: 1.0, p: { crouch: 0.22, hipDrop: 12, lean: 0.14, look: 'right', brow: 'determined', mouth: 'grin', handR: { x: 108, y: 1245 } } },
  { t: 1.55, p: { crouch: 0, hipDrop: 0, lean: 0.06, look: 'down', mouth: 'bigsmile', handR: { x: 102, y: 1085 } } },
  { t: 2.45, p: { lean: -0.06, look: 'down', brow: 'raised', mouth: 'grin', handR: { x: 96, y: 1030 } } },
  // 3.25s: Yo-yo swings upward and hits his forehead!
  { t: 3.25, p: { lean: -0.22, headTilt: -0.26, hipDrop: 8, footLift: 24, eye: 'shut', brow: 'angry', mouth: 'grit', gripR: false, handL: { x: -86, y: 1120 }, handR: { x: 88, y: 1045 } } },
  { t: 4.5, p: { lean: 0.02, headTilt: 0, hipDrop: 0, footLift: 0, look: 'right', eye: 'open', brow: 'determined', mouth: 'smirk', handL: { x: -60, y: 1195 }, handR: { x: 108, y: 1125 }, pointR: true } },

  // Scene 2: Places orange ball on spinning yo-yo, launches toward cup -> misses by an inch!
  { t: 6.0, p: { pointR: false, lean: 0.1, look: 'right', brow: 'determined', mouth: 'grin', handL: { x: 74, y: 1135 }, handR: { x: 96, y: 1055 }, gripR: true } },
  { t: 7.75, p: { lean: 0.14, look: 'right', mouth: 'bigsmile', handL: { x: -72, y: 1165 }, handR: { x: 116, y: 1095 } } },
  { t: 9.0, p: { lean: 0.18, look: 'right', eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -58, y: 1140 }, handR: { x: 118, y: 1120 } } },
  // 10.45s: Misses by an inch! Frustrated groan
  { t: 10.45, p: { gripR: false, lean: 0.04, look: 'right', eye: 'squint', brow: 'angry', mouth: 'frown', handL: { x: -64, y: 1205 }, handR: { x: 64, y: 1205 }, fistL: true, fistR: true } },

  // Scene 3: Stretches string up to ceiling pulley & adds 3 spinning hoops -> test glide!
  { t: 12.0, p: { fistL: false, fistR: false, lean: -0.04, look: 'up', brow: 'determined', mouth: 'smirk', handL: { x: -78, y: 1045 }, handR: { x: 88, y: 1020 }, gripL: true, gripR: true } },
  { t: 14.5, p: { lean: 0.06, look: 'right', eye: 'wide', brow: 'raised', mouth: 'grin', handL: { x: -54, y: 1085 }, handR: { x: 92, y: 1065 } } },
  { t: 16.4, p: { gripL: false, gripR: false, lean: 0.12, look: 'right', eye: 'happy', brow: 'cocky', mouth: 'bigsmile', handL: { x: -62, y: 1165 }, handR: { x: 116, y: 1105 }, pointR: true } },

  // Scene 4: Pulls string far back left -> PERFECT RELEASE through all 3 hoops!
  { t: 18.0, p: { pointR: false, lean: -0.24, crouch: 0.2, hipDrop: 12, look: 'left', brow: 'determined', mouth: 'grit', handL: { x: -102, y: 1135 }, handR: { x: -84, y: 1110 }, gripL: true, gripR: true } },
  { t: 19.45, p: { crouch: 0, hipDrop: 0, lean: 0.12, gripL: false, gripR: false, look: 'right', eye: 'wide', brow: 'raised', mouth: 'bigsmile', handL: { x: -70, y: 1095 }, handR: { x: 98, y: 1075 } } },
  { t: 22.0, p: { lean: 0.16, hipDrop: 14, look: 'right', eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -64, y: 1125 }, handR: { x: 86, y: 1125 }, fistL: true, fistR: true } },

  // Scene 5: Ball lands in cup! Celebrates -> yo-yo returns, wraps waist, yanks him upward like a human yo-yo!
  { t: 24.05, p: { fistL: false, fistR: false, lean: 0, hipDrop: 0, eye: 'happy', brow: 'raised', mouth: 'bigsmile', handL: { x: -116, y: 925 }, handR: { x: 116, y: 925 } } },
  // 26.65s: Yo-yo slams his waist and wraps the string around him!
  { t: 26.65, p: { lean: 0.22, hipDrop: 6, eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -105, y: 1105 }, handR: { x: 105, y: 1105 } } },
  // 27.15s: Yanked upward into the air like a human yo-yo, beanie drops off!
  { t: 27.15, p: { beanieOn: false, bodySpin: Math.PI * 0.88, lean: 0, hipDrop: 0, footLift: 12, look: 'center', eye: 'squint', brow: 'uneven', mouth: 'frown', handL: { x: -95, y: 1140 }, handR: { x: 95, y: 1140 } } },
  { t: 28.4, p: { beanieOn: false, bodySpin: Math.PI * 0.94, eye: 'squint', brow: 'uneven', mouth: 'frown', handL: { x: -82, y: 1175 }, handR: { x: 82, y: 1175 } } },
];

interface PoseKey extends Pose {
  t: number;
}

const POSE_KEYS: PoseKey[] = (() => {
  let acc: Pose = {
    ...BASE_POSE,
    handL: { ...BASE_POSE.handL },
    handR: { ...BASE_POSE.handR },
  };
  return POSE_PATCHES.map(({ t, p }) => {
    acc = {
      ...acc,
      ...p,
      handL: p?.handL ? { ...p.handL } : { ...acc.handL },
      handR: p?.handR ? { ...p.handR } : { ...acc.handR },
    };
    return { t, ...acc };
  });
})();

const CAPTIONS: { from: number; to: number; text: string }[] = [
  { from: 0.25, to: 5.75, text: 'THIS YO-YO IS HUGE!' },
  { from: 6.25, to: 11.75, text: 'SPIN POWER!' },
  { from: 12.25, to: 17.75, text: 'THREE HOOPS!' },
  { from: 18.25, to: 23.75, text: 'PERFECT RELEASE!' },
  { from: 24.25, to: 29.85, text: "I'M THE YO-YO NOW! 😂" },
];

interface Arm {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
}

interface CharState {
  x: number;
  lift: number;
  dancePhase: number;
}

interface YoYoState {
  x: number;
  y: number;
  rot: number;
  // Connected anchor points for the strong white string (always connected!)
  anchor1: Pt;
  anchor2?: Pt;
  waistLoops: number; // 0..3 loops wrapped around Stickman's waist in Scene 5
}

interface BallState {
  visible: boolean;
  x: number;
  y: number;
  rot: number;
  inCup: boolean;
}

export class GiantYoyoRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const ch = this.charAt(time);
    const pose = this.poseAt(time, ch.dancePhase);
    const arms = this.computeArms(pose, ch.x, 1260 - ch.lift + pose.hipDrop + pose.crouch * 45, time);
    const yoyo = this.yoyoAt(time, ch, arms);
    const ball = this.ballAt(time, yoyo);

    // 1. Modern Pop 2D Studio Backdrop & Wooden Floor + Pedestal
    this.drawBackdrop(ctx);

    // 2. Ceiling Pulley Rig (Scenes 3-5) & Back Halves of Spinning Hoops
    if (time >= 12.0) {
      this.drawCeilingPulley(ctx);
      this.drawHoopsLayer(ctx, time, 'back');
    }

    // 3. Strong White String (connected continuously between anchor(s) and Yo-Yo!)
    this.drawYoYoString(ctx, yoyo);

    // 4. Tiny Golden Target Cup (Back rim behind ball if dropped inside)
    this.drawGoldenCupBack(ctx);

    // 5. Stickman Character (with human yo-yo hoist & waist spin in Scene 5!)
    this.drawCharacter(ctx, ch, pose, arms, yoyo.waistLoops, time);

    // 6. Dropped Spinning Red Beanie on Floor in Scene 5
    if (time >= 26.85) {
      this.drawDroppedBeanie(ctx, time);
    }

    // 7. Giant Red-and-Blue Yo-Yo
    this.drawYoYo(ctx, yoyo);

    // 8. Orange Ping-Pong Ball & Cup Front Rim
    if (ball.visible) {
      this.drawOrangeBall(ctx, ball);
    }
    this.drawGoldenCupFront(ctx, ball.inCup);

    // 9. Front Halves of Spinning Hoops (so Yo-Yo cleanly passes INSIDE them!)
    if (time >= 12.0) {
      this.drawHoopsLayer(ctx, time, 'front');
    }

    // 10. Action Sparks, Hoop Flashes & Victory Confetti
    this.drawActionFX(ctx, time);

    // 11. Burned-in Bold Pop Captions
    this.drawCaptions(ctx, time);

    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Character Position & Human Yo-Yo Vertical Hoist
  // -------------------------------------------------------------------------
  private charAt(t: number): CharState {
    let x = 245;
    let lift = 0;
    let dancePhase = 0;

    // Step closer to inspect yo-yo in Scene 1
    if (t >= 0.8 && t < 1.55) {
      x = lerp(245, 255, easeInOut(inv(0.8, 1.55, t)));
    } else if (t >= 1.55 && t < 3.25) {
      x = 255;
    } else if (t >= 3.25 && t < 3.9) {
      x = lerp(255, 232, easeOut(inv(3.25, 3.9, t)));
    } else if (t >= 3.9 && t < 4.8) {
      x = lerp(232, 248, easeInOut(inv(3.9, 4.8, t)));
    } else if (t >= 4.8 && t < 18.0) {
      x = 248;
    } else if (t >= 18.0 && t < 19.45) {
      // Pulls back left to wind up the giant yo-yo
      x = lerp(248, 222, easeInOut(inv(18.0, 19.45, t)));
    } else if (t >= 19.45 && t < 24.0) {
      x = lerp(222, 260, easeOut(inv(19.45, 20.1, t)));
    } else if (t >= 24.0 && t < 26.65) {
      x = 260;
      if (t >= 24.1 && t < 25.85) {
        const dt = t - 24.1;
        lift = Math.abs(Math.sin(dt * Math.PI * 3.4)) * 38;
        dancePhase = dt * Math.PI * 3.4;
      }
    } else if (t >= 26.65) {
      // Yanked upward by the white string as a human yo-yo!
      const pullU = easeOut(inv(26.85, 27.65, t));
      const baseLift = lerp(0, 610, pullU);
      // Realistic elastic yo-yo vertical bounce up and down after being hoisted
      const bounce = t >= 27.65 ? Math.sin((t - 27.65) * 5.2) * 58 : 0;
      lift = baseLift + bounce;
      x = lerp(260, 315, pullU) + Math.sin(t * 2.6) * 14 * pullU;
    }

    return { x, lift, dancePhase };
  }

  private poseAt(t: number, dancePhase: number): Pose {
    let prev = POSE_KEYS[0];
    let next = POSE_KEYS[POSE_KEYS.length - 1];
    for (let i = 0; i < POSE_KEYS.length - 1; i++) {
      if (t >= POSE_KEYS[i].t && t < POSE_KEYS[i + 1].t) {
        prev = POSE_KEYS[i];
        next = POSE_KEYS[i + 1];
        break;
      }
    }
    if (t >= next.t) prev = next;

    const span = Math.max(0.001, next.t - prev.t);
    const u = easeInOut(clamp((t - prev.t) / span, 0, 1));
    const snap = u > 0.35 ? next : prev;

    const p: Pose = {
      lean: lerp(prev.lean, next.lean, u),
      hipDrop: lerp(prev.hipDrop, next.hipDrop, u),
      crouch: lerp(prev.crouch, next.crouch, u),
      bodySpin: lerp(prev.bodySpin, next.bodySpin, u),
      headTilt: lerp(prev.headTilt, next.headTilt, u),
      headTurn: lerp(prev.headTurn, next.headTurn, u),
      headDrop: lerp(prev.headDrop, next.headDrop, u),
      beanieOn: snap.beanieOn,
      look: snap.look,
      mouth: snap.mouth,
      brow: snap.brow,
      eye: snap.eye,
      stance: lerp(prev.stance, next.stance, u),
      footLift: lerp(prev.footLift, next.footLift, u),
      handL: { x: lerp(prev.handL.x, next.handL.x, u), y: lerp(prev.handL.y, next.handL.y, u) },
      handR: { x: lerp(prev.handR.x, next.handR.x, u), y: lerp(prev.handR.y, next.handR.y, u) },
      bendL: snap.bendL,
      bendR: snap.bendR,
      pointL: snap.pointL,
      pointR: snap.pointR,
      fistL: snap.fistL,
      fistR: snap.fistR,
      gripL: snap.gripL,
      gripR: snap.gripR,
    };

    if (dancePhase > 0) {
      const wave = Math.sin(dancePhase);
      p.handL.y -= Math.abs(wave) * 32;
      p.handR.y -= Math.abs(Math.cos(dancePhase)) * 32;
      p.headTilt += wave * 0.08;
    }

    // Dangling arm & leg sway when hoisted as a human yo-yo (27.15-30.0s)
    if (t >= 27.15) {
      const sway = Math.sin((t - 27.15) * 4.5);
      p.bodySpin += sway * 0.14;
      p.handL.x += sway * 16;
      p.handR.x -= sway * 16;
    }

    return p;
  }

  // -------------------------------------------------------------------------
  // Continuous Yo-Yo & Connected String Trajectory (0 -> 30s)
  // -------------------------------------------------------------------------
  private yoyoAt(t: number, ch: CharState, arms: { l: Arm; r: Arm }): YoYoState {
    const handAnchor = { x: arms.r.hx, y: arms.r.hy };

    // Scene 1 (0–6s): Discover on floor -> lift -> drop & spin -> swing up to forehead bonk -> settle
    if (t < 6.0) {
      if (t < 1.0) {
        return {
          x: 375,
          y: FLOOR_Y - YOYO_R,
          rot: 0,
          anchor1: handAnchor,
          waistLoops: 0,
        };
      }
      if (t < 1.55) {
        const u = easeInOut(inv(1.0, 1.55, t));
        return {
          x: lerp(375, 365, u),
          y: lerp(FLOOR_Y - YOYO_R, 1140, u),
          rot: lerp(0, 1.2, u),
          anchor1: handAnchor,
          waistLoops: 0,
        };
      }
      if (t < 2.45) {
        const u = easeIn(inv(1.55, 2.45, t));
        return {
          x: 365,
          y: lerp(1140, 1445, u),
          rot: 1.2 + u * 18,
          anchor1: handAnchor,
          waistLoops: 0,
        };
      }
      if (t < 3.25) {
        const u = easeOut(inv(2.45, 3.25, t));
        return {
          x: lerp(365, 286, u),
          y: lerp(1445, 998, u),
          rot: 19.2 + u * 14,
          anchor1: handAnchor,
          waistLoops: 0,
        };
      }
      if (t < 4.25) {
        const u = easeIn(inv(3.25, 4.25, t));
        return {
          x: lerp(286, 370, u),
          y: lerp(998, FLOOR_Y - YOYO_R, u),
          rot: 33.2 - u * 4,
          anchor1: handAnchor,
          waistLoops: 0,
        };
      }
      return {
        x: 370,
        y: FLOOR_Y - YOYO_R,
        rot: 29.2,
        anchor1: handAnchor,
        waistLoops: 0,
      };
    }

    // Scene 2 (6–12s): Spin yo-yo in front, carry orange ball, whip forward to launch ball, recoil back
    if (t < 12.0) {
      if (t < 7.75) {
        const u = easeInOut(inv(6.0, 6.65, t));
        return {
          x: lerp(370, 385, u),
          y: lerp(FLOOR_Y - YOYO_R, 1215, u),
          rot: 29.2 + (t - 6.0) * 10,
          anchor1: handAnchor,
          waistLoops: 0,
        };
      }
      if (t < 8.85) {
        // Drops & whips forward along strong string
        const u = easeInOut(inv(7.75, 8.85, t));
        return {
          x: quadBez(385, 495, 585, u),
          y: quadBez(1215, 1385, 1215, u),
          rot: 46.7 + u * 24,
          anchor1: handAnchor,
          waistLoops: 0,
        };
      }
      if (t < 10.2) {
        // Recoils smoothly back toward Stickman's hand & floor
        const u = easeInOut(inv(8.85, 10.2, t));
        return {
          x: lerp(585, 365, u),
          y: lerp(1215, FLOOR_Y - YOYO_R, u),
          rot: 70.7 - u * 12,
          anchor1: handAnchor,
          waistLoops: 0,
        };
      }
      return {
        x: 365,
        y: FLOOR_Y - YOYO_R,
        rot: 58.7,
        anchor1: handAnchor,
        waistLoops: 0,
      };
    }

    // Scene 3 (12–18s): Stretches string through ceiling pulley, test swings through 3 spinning hoops!
    if (t < 18.0) {
      const pullAnchor = { x: arms.l.hx, y: arms.l.hy };
      if (t < 13.85) {
        const u = easeInOut(inv(12.0, 13.85, t));
        return {
          x: lerp(365, 260, u),
          y: lerp(FLOOR_Y - YOYO_R, 895, u),
          rot: 58.7 + u * 8,
          anchor1: PULLEY_POS,
          anchor2: pullAnchor,
          waistLoops: 0,
        };
      }
      if (t < 14.5) {
        return {
          x: 260,
          y: 895,
          rot: 66.7 + (t - 13.85) * 6,
          anchor1: PULLEY_POS,
          anchor2: pullAnchor,
          waistLoops: 0,
        };
      }
      if (t < 16.95) {
        // Practice glide through HOOP 1 -> HOOP 2 -> HOOP 3!
        const u = easeInOut(inv(14.5, 16.95, t));
        return {
          x: lerp(260, 795, u),
          y: quadBez(895, 1110, 895, u),
          rot: 70.6 + u * 26,
          anchor1: PULLEY_POS,
          anchor2: pullAnchor,
          waistLoops: 0,
        };
      }
      const u = easeInOut(inv(16.95, 17.95, t));
      return {
        x: lerp(795, 260, u),
        y: quadBez(895, 1110, 895, u),
        rot: 96.6 - u * 10,
        anchor1: PULLEY_POS,
        anchor2: pullAnchor,
        waistLoops: 0,
      };
    }

    // Scene 4 (18–24s): Pulls far back left -> PERFECT RELEASE through all 3 hoops!
    if (t < 24.0) {
      const pullAnchor = { x: arms.r.hx, y: arms.r.hy };
      if (t < 19.45) {
        const u = easeInOut(inv(18.0, 19.45, t));
        return {
          x: lerp(260, 145, u),
          y: lerp(895, 770, u),
          rot: 86.6 + u * 6,
          anchor1: PULLEY_POS,
          anchor2: pullAnchor,
          waistLoops: 0,
        };
      }
      if (t < 21.85) {
        // Fast swing through HOOP 1 (20.15s) -> HOOP 2 (20.80s) -> HOOP 3 (21.45s) -> launch point (21.85s)!
        const u = easeInOut(inv(19.45, 21.85, t));
        return {
          x: lerp(145, 790, u),
          y: quadBez(770, 1200, 915, u),
          rot: 92.6 + u * 54,
          anchor1: PULLEY_POS,
          anchor2: pullAnchor,
          waistLoops: 0,
        };
      }
      // Swings slightly further right and holds near far side as ball flies into cup
      const u = easeOut(inv(21.85, 22.8, t));
      return {
        x: lerp(790, 865, u),
        y: lerp(915, 855, u),
        rot: 146.6 + u * 8,
        anchor1: PULLEY_POS,
        anchor2: pullAnchor,
        waistLoops: 0,
      };
    }

    // Scene 5 (24–30s): Hovers right during celebration -> zips back -> wraps waist -> drops down as counterweight hoisting Stickman up!
    if (t < 25.75) {
      return {
        x: 865,
        y: 855 + Math.sin(t * 4) * 8,
        rot: 154.6 + (t - 24.0) * 4,
        anchor1: PULLEY_POS,
        anchor2: { x: ch.x, y: 1200 },
        waistLoops: 0,
      };
    }
    if (t < 26.65) {
      // Races backward along pendulum string straight toward Stickman's waist!
      const u = easeIn(inv(25.75, 26.65, t));
      return {
        x: lerp(865, ch.x + 28, u),
        y: quadBez(855, 1185, 1210, u),
        rot: 161.6 - u * 44,
        anchor1: PULLEY_POS,
        anchor2: { x: ch.x, y: 1210 },
        waistLoops: 0,
      };
    }
    if (t < 27.15) {
      // Wraps string around his waist and snaps across to the right counterweight side!
      const u = easeInOut(inv(26.65, 27.15, t));
      const waistY = 1260 - ch.lift;
      return {
        x: lerp(ch.x + 28, 725, u),
        y: quadBez(1210, 1080, 1180, u),
        rot: 117.6 - u * 22,
        anchor1: PULLEY_POS,
        anchor2: { x: ch.x, y: waistY },
        waistLoops: Math.ceil(u * 3),
      };
    }

    // 27.15–30.0s: Giant yo-yo acts as heavy counterweight on the right while Stickman hangs hoisted on the left!
    const waistY = 1260 - ch.lift;
    const bob = Math.sin((t - 27.65) * 5.2) * 32;
    const dropU = easeOut(inv(27.15, 27.7, t));
    return {
      x: lerp(725, 765, dropU),
      y: lerp(1180, 1335, dropU) - bob,
      rot: 95.6 + (t - 27.15) * 14,
      anchor1: PULLEY_POS,
      anchor2: { x: ch.x, y: waistY },
      waistLoops: 3,
    };
  }

  // -------------------------------------------------------------------------
  // Continuous Orange Ping-Pong Ball Trajectory
  // -------------------------------------------------------------------------
  private ballAt(t: number, yoyo: YoYoState): BallState {
    // Scene 1: Not yet on yo-yo; rests cleanly on small floor shelf/side until Scene 2
    if (t < 6.0) {
      return { visible: false, x: 135, y: FLOOR_Y - BALL_R, rot: 0, inCup: false };
    }

    // Scene 2 (6–12s): Placed on yo-yo spinning surface -> rides launch -> misses cup by 1 inch!
    if (t < 12.0) {
      if (t < 6.65) {
        const u = easeInOut(inv(6.0, 6.65, t));
        return {
          visible: true,
          x: lerp(290, yoyo.x, u),
          y: lerp(1135, yoyo.y - YOYO_R - BALL_R + 4, u),
          rot: u * 4,
          inCup: false,
        };
      }
      if (t < 8.85) {
        return {
          visible: true,
          x: yoyo.x,
          y: yoyo.y - YOYO_R - BALL_R + 4,
          rot: t * 8,
          inCup: false,
        };
      }
      if (t < 10.35) {
        // Launches in fast arc toward golden cup, misses right rim by an inch!
        const u = inv(8.85, 10.35, t);
        return {
          visible: true,
          x: lerp(585, 926, u),
          y: quadBez(1135, 740, 1254, u),
          rot: 70 + u * 22,
          inCup: false,
        };
      }
      if (t < 11.15) {
        const u = inv(10.35, 11.15, t);
        return {
          visible: true,
          x: lerp(926, 995, u),
          y: quadBez(1254, 1185, FLOOR_Y - BALL_R, u),
          rot: 92 + u * 10,
          inCup: false,
        };
      }
      return {
        visible: true,
        x: 995,
        y: FLOOR_Y - BALL_R,
        rot: 102,
        inCup: false,
      };
    }

    // Scene 3 (12–18s): Rides yo-yo through 3 spinning hoops on test glide!
    if (t < 18.0) {
      if (t < 13.85) {
        const u = easeInOut(inv(13.0, 13.85, t));
        return {
          visible: true,
          x: lerp(260, yoyo.x, u),
          y: lerp(1100, yoyo.y - YOYO_R - BALL_R + 4, u),
          rot: u * 3,
          inCup: false,
        };
      }
      return {
        visible: true,
        x: yoyo.x,
        y: yoyo.y - YOYO_R - BALL_R + 4,
        rot: yoyo.rot * 0.4,
        inCup: false,
      };
    }

    // Scene 4 (18–24s): Rides giant yo-yo through all 3 hoops -> rockets toward tiny golden cup!
    if (t < 21.85) {
      return {
        visible: true,
        x: yoyo.x,
        y: yoyo.y - YOYO_R - BALL_R + 4,
        rot: yoyo.rot * 0.6,
        inCup: false,
      };
    }

    if (t < 24.05) {
      const u = inv(21.85, 24.05, t);
      return {
        visible: true,
        x: lerp(790, CUP_POS.x, u),
        y: quadBez(835, 580, CUP_POS.y - 6, u),
        rot: 120 + u * 28,
        inCup: u > 0.96,
      };
    }

    // Scene 5 (24–30s): Resting triumphantly inside the tiny golden cup!
    return {
      visible: true,
      x: CUP_POS.x,
      y: CUP_POS.y - 4,
      rot: 148,
      inCup: true,
    };
  }

  // -------------------------------------------------------------------------
  // Room Backdrop, Ceiling Pulley, Spinning Hoops & Tiny Golden Cup
  // -------------------------------------------------------------------------
  private drawBackdrop(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = WALL_BG;
    ctx.fillRect(0, 0, WIDTH, FLOOR_Y);

    // Subtle pop vertical panels
    ctx.fillStyle = WALL_BAND;
    ctx.fillRect(0, 1180, WIDTH, FLOOR_Y - 1180);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 1180);
    ctx.lineTo(WIDTH, 1180);
    ctx.stroke();

    // Warm Wooden Floor Deck
    ctx.fillStyle = FLOOR_WOOD;
    ctx.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);
    ctx.fillStyle = FLOOR_ALT;
    for (let px = 0; px < WIDTH; px += 180) {
      ctx.fillRect(px, FLOOR_Y, 85, HEIGHT - FLOOR_Y);
    }
    ctx.strokeStyle = FLOOR_BORDER;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(WIDTH, FLOOR_Y);
    ctx.stroke();

    // Right Pedestal supporting the Tiny Golden Target Cup
    ctx.fillStyle = PEDESTAL_COLOR;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(PEDESTAL_RECT.x, PEDESTAL_RECT.y, PEDESTAL_RECT.w, PEDESTAL_RECT.h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PEDESTAL_TOP;
    ctx.beginPath();
    ctx.roundRect(PEDESTAL_RECT.x - 10, PEDESTAL_RECT.y - 12, PEDESTAL_RECT.w + 20, 22, 6);
    ctx.fill();
    ctx.stroke();
  }

  private drawCeilingPulley(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(PULLEY_POS.x, PULLEY_POS.y);

    // Bracket arm up to ceiling
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(-18, -230, 36, 230);
    ctx.fill();
    ctx.stroke();

    // Pulley wheel
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private drawHoopsLayer(ctx: CanvasRenderingContext2D, t: number, half: 'back' | 'front') {
    for (const hoop of HOOPS) {
      const spin = t * 3.8 + hoop.id * 1.4;
      const pass1 = Math.exp(-Math.pow((t - hoop.passT1) / 0.25, 2));
      const pass2 = Math.exp(-Math.pow((t - hoop.passT2) / 0.22, 2));
      const boost = Math.max(pass1, pass2);

      ctx.save();
      ctx.translate(hoop.x, hoop.y);

      // Hanging cord to ceiling bar on back pass only
      if (half === 'back') {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, -hoop.r);
        ctx.lineTo(0, -hoop.y);
        ctx.stroke();
      }

      // Draw half-ellipse hoop so yo-yo appears cleanly INSIDE the ring!
      const startA = half === 'back' ? Math.PI * 0.5 : -Math.PI * 0.5;
      const endA = half === 'back' ? Math.PI * 1.5 : Math.PI * 0.5;

      // Outer black border
      ctx.strokeStyle = INK;
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.ellipse(0, 0, 38, hoop.r, 0, startA, endA);
      ctx.stroke();

      // Colored pop ring
      ctx.strokeStyle = boost > 0.4 ? '#fde047' : hoop.color;
      ctx.lineWidth = 13;
      ctx.beginPath();
      ctx.ellipse(0, 0, 38, hoop.r, 0, startA, endA);
      ctx.stroke();

      // Spinning stripe dots around the ring to sell constant spin!
      for (let i = 0; i < 6; i++) {
        const ang = (spin + (i / 6) * TAU) % TAU;
        const onThisHalf = half === 'back' ? Math.cos(ang) <= 0 : Math.cos(ang) >= 0;
        if (!onThisHalf) continue;
        const sx = Math.cos(ang) * 38;
        const sy = Math.sin(ang) * hoop.r;
        ctx.fillStyle = WHITE;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private drawYoYoString(ctx: CanvasRenderingContext2D, yoyo: YoYoState) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawSegment = (p0: Pt, p1: Pt) => {
      // Thick black outline
      ctx.strokeStyle = INK;
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();

      // Strong bright white string center
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    };

    if (yoyo.anchor2) {
      drawSegment(yoyo.anchor2, yoyo.anchor1);
    }
    drawSegment(yoyo.anchor1, { x: yoyo.x, y: yoyo.y });
    ctx.restore();
  }

  private drawYoYo(ctx: CanvasRenderingContext2D, yoyo: YoYoState) {
    ctx.save();
    ctx.translate(yoyo.x, yoyo.y);
    ctx.rotate(yoyo.rot);

    // Thick outer silhouette
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;

    // Top / Left vibrant Red half
    ctx.fillStyle = YOYO_RED;
    ctx.beginPath();
    ctx.arc(0, 0, YOYO_R, Math.PI * 0.5, Math.PI * 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red crescent shade
    ctx.fillStyle = YOYO_RED_DEEP;
    ctx.beginPath();
    ctx.arc(0, 0, YOYO_R - 10, Math.PI * 0.75, Math.PI * 1.35);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Bottom / Right vibrant Blue half
    ctx.fillStyle = YOYO_BLUE;
    ctx.beginPath();
    ctx.arc(0, 0, YOYO_R, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Blue crescent shade
    ctx.fillStyle = YOYO_BLUE_DEEP;
    ctx.beginPath();
    ctx.arc(0, 0, YOYO_R - 10, -Math.PI * 0.25, Math.PI * 0.35);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Center white divider ring & axle hub
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Spinning star cross inside white hub so spin speed is super readable
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(12, 0);
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 12);
    ctx.stroke();

    ctx.restore();
  }

  private drawOrangeBall(ctx: CanvasRenderingContext2D, ball: BallState) {
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.rot);

    ctx.fillStyle = BALL_ORANGE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = BALL_DEEP;
    ctx.beginPath();
    ctx.arc(3, 4, BALL_R - 5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.fill();

    ctx.fillStyle = BALL_GLOW;
    ctx.beginPath();
    ctx.arc(-6, -6, 5.5, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private drawGoldenCupBack(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(CUP_POS.x, CUP_POS.y);
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, -24, 30, 9, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawGoldenCupFront(ctx: CanvasRenderingContext2D, inCup: boolean) {
    ctx.save();
    ctx.translate(CUP_POS.x, CUP_POS.y);

    // Golden cup trapezoid body
    ctx.fillStyle = inCup ? '#fde047' : CUP_GOLD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-30, -24);
    ctx.lineTo(30, -24);
    ctx.lineTo(20, 30);
    ctx.lineTo(-20, 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner gold sheen
    ctx.fillStyle = CUP_GOLD_DEEP;
    ctx.beginPath();
    ctx.moveTo(4, -20);
    ctx.lineTo(25, -20);
    ctx.lineTo(17, 26);
    ctx.lineTo(2, 26);
    ctx.closePath();
    ctx.fill();

    // Rim highlight arc
    ctx.strokeStyle = CUP_RIM;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, -24, 28, 7, 0, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  private drawDroppedBeanie(ctx: CanvasRenderingContext2D, t: number) {
    const uFall = clamp((t - 26.85) / 0.55, 0, 1);
    const bx = lerp(310, 275, uFall);
    const by = lerp(695, FLOOR_Y - 12, easeIn(uFall));
    const spin = uFall >= 1 ? (t - 27.4) * 16 : uFall * 8;

    ctx.save();
    ctx.translate(bx, by);
    // Spinning top wobble on the floor
    ctx.rotate(Math.sin(spin) * 0.24);
    const scaleX = Math.cos(spin);
    ctx.scale(Math.abs(scaleX) < 0.25 ? (scaleX >= 0 ? 0.25 : -0.25) : scaleX, 1);
    this.drawBeanieShape(ctx, true);

    // Spin swoosh rings above the beanie on floor
    if (uFall >= 1) {
      ctx.scale(1 / (Math.abs(scaleX) < 0.25 ? 0.25 : Math.abs(scaleX)), 1);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, -56, 36, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawActionFX(ctx: CanvasRenderingContext2D, t: number) {
    // Scene 1 forehead bonk star burst (3.25-4.1s)
    if (t >= 3.25 && t <= 4.15) {
      const u = inv(3.25, 4.15, t);
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * TAU + u * 3;
        const r = 36 + u * 58;
        ctx.save();
        ctx.translate(255 + Math.cos(ang) * r, 995 + Math.sin(ang) * r);
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 9 * (1 - u * 0.6), 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // Scene 5 golden cup confetti burst (24.05-26.4s)
    if (t >= 24.05 && t <= 26.4) {
      const u = inv(24.05, 26.4, t);
      const colors = ['#facc15', '#ef4444', '#2563eb', '#f97316', '#10b981'];
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * TAU;
        const dist = 42 + u * (175 + (i % 4) * 28);
        const px = CUP_POS.x + Math.cos(ang) * dist;
        const py = CUP_POS.y - 25 + Math.sin(ang) * dist * 0.72 + u * u * 145;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(u * 6 + i);
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.fillRect(-7, -4, 14, 8);
        ctx.strokeRect(-7, -4, 14, 8);
        ctx.restore();
      }
    }
  }

  // -------------------------------------------------------------------------
  // Locked Angry Stickman Rig (with Scene 5 Human Yo-Yo Waist Wrap & Hoist!)
  // -------------------------------------------------------------------------
  private drawCharacter(
    ctx: CanvasRenderingContext2D,
    ch: CharState,
    pose: Pose,
    arms: { l: Arm; r: Arm },
    waistLoops: number,
    _t: number
  ) {
    const x = ch.x;
    const hipY = 1260 - ch.lift + pose.hipDrop + pose.crouch * 45;

    ctx.save();
    if (Math.abs(pose.bodySpin) > 0.001) {
      ctx.translate(x, hipY - 82);
      ctx.rotate(pose.bodySpin);
      ctx.translate(-x, -(hipY - 82));
    }

    const shoulderY = hipY - 170;
    const bodyTopX = x + Math.sin(pose.lean) * 170;
    const bodyTilt = pose.lean;

    const footSpread = 22 + pose.stance;
    const footLX = x - footSpread;
    const footLY = FLOOR_Y - 14 - ch.lift - (pose.footLift > 0 ? pose.footLift : 0);
    const footRX = x + footSpread;
    const footRY = FLOOR_Y - 14 - ch.lift;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(arms.l.sx, arms.l.sy);
    ctx.lineTo(arms.l.ex, arms.l.ey);
    ctx.lineTo(arms.l.hx, arms.l.hy);
    ctx.stroke();
    this.drawSleeve(ctx, arms.l);

    ctx.strokeStyle = TROUSER;
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(x - 16, hipY);
    ctx.lineTo(footLX, footLY);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.stroke();
    this.drawShoe(ctx, footLX, footLY, 0);

    ctx.strokeStyle = TROUSER;
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(x + 16, hipY);
    ctx.lineTo(footRX, footRY);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.stroke();
    this.drawShoe(ctx, footRX, footRY, 0);

    ctx.save();
    ctx.translate(x, hipY);
    ctx.rotate(bodyTilt);
    ctx.fillStyle = SHIRT;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-42, -176, 84, 178, 22);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = SHIRT_DEEP;
    ctx.fillRect(-38, -24, 76, 20);

    // White Yo-Yo String wrapped snugly around his waist in Scene 5!
    if (waistLoops > 0) {
      for (let i = 0; i < waistLoops; i++) {
        const wy = -46 + i * 14;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(-45, wy);
        ctx.lineTo(45, wy + 5);
        ctx.stroke();

        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(-45, wy);
        ctx.lineTo(45, wy + 5);
        ctx.stroke();
      }
    }
    ctx.restore();

    const headCx = bodyTopX + Math.sin(pose.headTilt) * 12;
    const headCy = shoulderY - 20 - HEAD_R + pose.headDrop;
    this.drawHead(ctx, headCx, headCy, pose);

    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(arms.r.sx, arms.r.sy);
    ctx.lineTo(arms.r.ex, arms.r.ey);
    ctx.lineTo(arms.r.hx, arms.r.hy);
    ctx.stroke();
    this.drawSleeve(ctx, arms.r);

    drawHand(ctx, arms.l, {
      side: 'left',
      pose: pose.pointL ? 'point' : pose.fistL ? 'fist' : pose.gripL ? 'grip' : 'relaxed',
      layer: 'full',
    });
    drawHand(ctx, arms.r, {
      side: 'right',
      pose: pose.pointR ? 'point' : pose.fistR ? 'fist' : pose.gripR ? 'grip' : 'relaxed',
      layer: 'full',
    });

    ctx.restore();
  }

  private drawShoe(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = SHOE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-34, -13, 68, 26, 11);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath();
    ctx.roundRect(-26, -8, 15, 6, 3);
    ctx.fill();
    ctx.restore();
  }

  private drawSleeve(ctx: CanvasRenderingContext2D, arm: Arm) {
    const dx = arm.ex - arm.sx;
    const dy = arm.ey - arm.sy;
    const len = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / len;
    const uy = dy / len;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 38;
    ctx.beginPath();
    ctx.moveTo(arm.sx, arm.sy);
    ctx.lineTo(arm.sx + ux * 36, arm.sy + uy * 36);
    ctx.stroke();
    ctx.strokeStyle = SHIRT;
    ctx.lineWidth = 29;
    ctx.beginPath();
    ctx.moveTo(arm.sx, arm.sy);
    ctx.lineTo(arm.sx + ux * 36, arm.sy + uy * 36);
    ctx.stroke();
    ctx.strokeStyle = SHIRT_DEEP;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(arm.sx + ux * 34 - uy * 14, arm.sy + uy * 34 + ux * 14);
    ctx.lineTo(arm.sx + ux * 34 + uy * 14, arm.sy + uy * 34 - ux * 14);
    ctx.stroke();
  }

  private computeArms(pose: Pose, x: number, hipY: number, _t: number): { l: Arm; r: Arm } {
    const shoulderY = hipY - 170;
    const bodyTopX = x + Math.sin(pose.lean) * 170;
    const headCx = bodyTopX + Math.sin(pose.headTilt) * 12;
    const headCy = shoulderY - 20 - HEAD_R + pose.headDrop;
    const handClear = HEAD_R + 26;
    const elbowClear = HEAD_R + 30;
    const hipShift = hipY - 1260;

    const solve = (side: -1 | 1, target: Pt, bend: 1 | -1): Arm => {
      const sx = bodyTopX + side * 36;
      const sy = shoulderY;
      let hx = x + target.x;
      let hy = target.y + hipShift;
      const hdx = hx - headCx;
      const hdy = hy - headCy;
      const hd = Math.hypot(hdx, hdy);
      if (hd < handClear && hd > 0.001) {
        hx = headCx + (hdx / hd) * handClear;
        hy = headCy + (hdy / hd) * handClear;
      }
      const ux = (hx - sx) * side;
      const uy = hy - sy;
      let d = Math.hypot(ux, uy);
      if (d < 30) d = 30;
      const base = Math.atan2(ux, uy);
      const upper = 118;
      const lower = 118;
      const cosAlpha = clamp((upper * upper + d * d - lower * lower) / (2 * upper * d), -1, 1);
      const alpha = Math.acos(cosAlpha);
      const elbowAt = (b: 1 | -1) => {
        const a1 = base + b * alpha;
        return { x: sx + Math.sin(a1) * side * upper, y: sy + Math.cos(a1) * upper };
      };
      const score = (e: Pt) => Math.hypot(e.x - headCx, e.y - headCy) + 0.35 * side * (e.x - sx);
      const preferred = elbowAt(bend);
      const other = elbowAt(bend === 1 ? -1 : 1);
      let elbow = score(preferred) + 8 >= score(other) ? preferred : other;
      const edx = elbow.x - headCx;
      const edy = elbow.y - headCy;
      const ed = Math.hypot(edx, edy);
      if (ed < elbowClear && ed > 0.001) {
        elbow = { x: headCx + (edx / ed) * elbowClear, y: headCy + (edy / ed) * elbowClear };
      }
      return { sx, sy, ex: elbow.x, ey: elbow.y, hx, hy };
    };

    return { l: solve(-1, pose.handL, pose.bendL), r: solve(1, pose.handR, pose.bendR) };
  }

  private drawHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, pose: Pose) {
    const r = HEAD_R;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(pose.headTilt);

    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (pose.beanieOn) this.drawBeanieShape(ctx, false);

    const eyeShiftY = pose.look === 'down' ? 7 : pose.look === 'up' ? -7 : 0;
    const eyeShiftX = pose.look === 'right' ? 7 : pose.look === 'left' ? -7 : 0;
    const eyeY = 8 + eyeShiftY;
    const eyeDX = 26;
    const fx = pose.headTurn + eyeShiftX;

    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;

    if (pose.eye === 'shut' || pose.eye === 'happy') {
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(fx + side * eyeDX, eyeY + 6, 14, Math.PI * 1.12, Math.PI * 1.88);
        ctx.stroke();
      }
    } else {
      const eyeH = pose.eye === 'wide' ? 34 : pose.eye === 'squint' ? 9 : 22;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(fx + side * eyeDX, eyeY, 10, eyeH / 2, 0, 0, TAU);
        ctx.fill();
      }
    }

    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    const browY = -12;
    ctx.beginPath();
    if (pose.brow === 'angry' || pose.brow === 'determined') {
      ctx.moveTo(fx - 42, browY - 8);
      ctx.lineTo(fx - 12, browY + 8);
      ctx.moveTo(fx + 42, browY - 8);
      ctx.lineTo(fx + 12, browY + 8);
    } else if (pose.brow === 'raised') {
      ctx.moveTo(fx - 42, browY - 13);
      ctx.lineTo(fx - 12, browY - 11);
      ctx.moveTo(fx + 42, browY - 13);
      ctx.lineTo(fx + 12, browY - 11);
    } else if (pose.brow === 'sad') {
      ctx.moveTo(fx - 42, browY + 8);
      ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY + 8);
      ctx.lineTo(fx + 12, browY - 8);
    } else if (pose.brow === 'cocky') {
      ctx.moveTo(fx - 42, browY - 8);
      ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY - 2);
      ctx.lineTo(fx + 12, browY + 4);
    } else if (pose.brow === 'uneven') {
      ctx.moveTo(fx - 42, browY - 15);
      ctx.lineTo(fx - 12, browY - 10);
      ctx.moveTo(fx + 42, browY + 8);
      ctx.lineTo(fx + 12, browY + 1);
    } else {
      ctx.moveTo(fx - 42, browY - 4);
      ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY - 4);
      ctx.lineTo(fx + 12, browY - 8);
    }
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineWidth = 6;
    const my = 40;
    ctx.beginPath();
    if (pose.mouth === 'bigsmile') {
      ctx.moveTo(fx - 34, my - 8);
      ctx.quadraticCurveTo(fx, my + 34, fx + 34, my - 8);
      ctx.quadraticCurveTo(fx, my + 8, fx - 34, my - 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.moveTo(fx - 27, my - 6);
      ctx.quadraticCurveTo(fx, my + 2, fx + 27, my - 6);
      ctx.lineTo(fx + 25, my - 12);
      ctx.lineTo(fx - 25, my - 12);
      ctx.closePath();
      ctx.fill();
    } else if (pose.mouth === 'grin') {
      ctx.arc(fx, my - 12, 26, 0.15 * Math.PI, 0.85 * Math.PI);
    } else if (pose.mouth === 'smile') {
      ctx.arc(fx, my - 14, 20, 0.2 * Math.PI, 0.8 * Math.PI);
    } else if (pose.mouth === 'smirk') {
      ctx.moveTo(fx - 22, my + 2);
      ctx.quadraticCurveTo(fx + 4, my + 10, fx + 24, my - 10);
    } else if (pose.mouth === 'frown') {
      ctx.arc(fx, my + 16, 24, 1.15 * Math.PI, 1.85 * Math.PI);
    } else if (pose.mouth === 'o') {
      ctx.ellipse(fx, my, 13, 17, 0, 0, TAU);
    } else if (pose.mouth === 'grit') {
      ctx.moveTo(fx - 24, my);
      ctx.lineTo(fx + 24, my);
      for (let i = -2; i <= 2; i++) {
        ctx.moveTo(fx + i * 10, my - 8);
        ctx.lineTo(fx + i * 10, my + 8);
      }
    } else {
      ctx.moveTo(fx - 18, my);
      ctx.lineTo(fx + 18, my);
    }
    ctx.stroke();
    ctx.restore();
  }

  private drawBeanieShape(ctx: CanvasRenderingContext2D, grounded: boolean) {
    const r = HEAD_R * (grounded ? 0.65 : 1);
    const yOff = grounded ? 28 : 0;
    ctx.save();
    ctx.translate(0, yOff);
    ctx.fillStyle = BEANIE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, -24, r + 5, Math.PI * 1.02, Math.PI * 1.98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = BEANIE_DEEP;
    ctx.beginPath();
    ctx.rect(-r - 5, -44, (r + 5) * 2, 20);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#f07178';
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 23 * (grounded ? 0.65 : 1), -70 * (grounded ? 0.85 : 1));
      ctx.lineTo(i * 23 * (grounded ? 0.65 : 1), -50 * (grounded ? 0.85 : 1));
      ctx.stroke();
    }
    ctx.fillStyle = BEANIE_POM;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -r - 33, grounded ? 12 : 16, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Captions & Safe Zones
  // -------------------------------------------------------------------------
  private drawCaptions(ctx: CanvasRenderingContext2D, t: number) {
    const caption = CAPTIONS.find((c) => t >= c.from && t <= c.to);
    if (!caption) return;

    const popIn = clamp((t - caption.from) / 0.16, 0, 1);
    const popOut = clamp((caption.to - t) / 0.18, 0, 1);
    const scale = easeOut(popIn) * easeOut(popOut);

    ctx.save();
    ctx.translate(WIDTH / 2, 1615);
    ctx.scale(scale, scale);

    ctx.font = '900 48px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    ctx.strokeText(caption.text, 0, 0, 920);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(caption.text, 0, 0, 920);
    ctx.restore();
  }

  private drawSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
    ctx.lineWidth = 3;
    ctx.setLineDash([16, 12]);
    ctx.strokeRect(80, 200, WIDTH - 160, HEIGHT - 460);
    ctx.restore();
  }
}
