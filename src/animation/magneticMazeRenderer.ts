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

// --- Magnetic Lab Palette (Modern Pop 2D Flat Vector) ----------------------
const LAB_WALL = '#f8fafc';
const LAB_BAND = '#e2e8f0';
const FLOOR_TILE = '#cbd5e1';
const FLOOR_LINE = '#94a3b8';

const METAL_LIGHT = '#e2e8f0';
const METAL_MID = '#94a3b8';
const METAL_DARK = '#475569';

const MAG_RED = '#ef4444';
const MAG_RED_DEEP = '#b91c1c';
const MAG_BLUE = '#3b82f6';
const MAG_BLUE_DEEP = '#1d4ed8';
const MAG_TIP = '#e2e8f0';

const MAZE_GLASS = 'rgba(186, 230, 253, 0.36)';
const MAZE_EDGE = '#0284c7';
const GOLD_CUP = '#facc15';
const GOLD_DEEP = '#ca8a04';
const FIELD_CYAN = '#06b6d4';

const FLOOR_Y = 1520;
const HEAD_R = 70;
const BALL_R = 19;

// --- Helpers ---------------------------------------------------------------
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const inv = (a: number, b: number, v: number) => clamp((v - a) / (b - a), 0, 1);
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const easeInOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

type Pt = { x: number; y: number };
type Look = 'center' | 'right' | 'left' | 'up' | 'down';
type Mouth = 'flat' | 'smile' | 'grin' | 'bigsmile' | 'smirk' | 'frown' | 'o' | 'grit';
type Brow = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'uneven' | 'determined';
type Eye = 'open' | 'wide' | 'squint' | 'shut' | 'happy';

interface Pose {
  lean: number;
  hipDrop: number;
  crouch: number;
  sit: number;
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
  sit: 0,
  headTilt: 0,
  headTurn: 2,
  headDrop: 0,
  beanieOn: true,
  look: 'right',
  mouth: 'smirk',
  brow: 'determined',
  eye: 'open',
  stance: 12,
  footLift: 0,
  handL: { x: -72, y: 1210 },
  handR: { x: 76, y: 1205 },
  bendL: -1,
  bendR: 1,
};

const POSE_PATCHES: { t: number; p: Partial<Pose> }[] = [
  // Scene 1: Places silver ball on table beside Red Magnet -> shock -> gets idea!
  { t: 0.0, p: { look: 'right', mouth: 'smirk', brow: 'determined', handL: { x: -64, y: 1210 }, handR: { x: 64, y: 1205 } } },
  {
    t: 0.95,
    p: {
      lean: 0.16,
      hipDrop: 12,
      headTilt: 0.08,
      look: 'right',
      mouth: 'smile',
      handR: { x: 108, y: 1110 },
      gripR: true,
    },
  },
  {
    t: 1.55,
    p: {
      lean: 0.04,
      hipDrop: 0,
      headTilt: 0,
      look: 'right',
      mouth: 'smirk',
      handR: { x: 74, y: 1195 },
      gripR: false,
    },
  },
  // Ball snaps onto red magnet at 2.75s -> shock!
  {
    t: 2.75,
    p: {
      lean: -0.14,
      headTilt: -0.1,
      look: 'right',
      eye: 'wide',
      brow: 'raised',
      mouth: 'o',
      handL: { x: -96, y: 1085 },
      handR: { x: 96, y: 1085 },
    },
  },
  // Gets the big idea at 3.85s -> grins and points!
  {
    t: 3.85,
    p: {
      lean: 0.08,
      headTilt: 0.06,
      eye: 'open',
      brow: 'cocky',
      mouth: 'bigsmile',
      look: 'right',
      handL: { x: -76, y: 1180 },
      handR: { x: 126, y: 1065 },
      pointR: true,
    },
  },

  // Scene 2: Places 2 magnets on opposite sides of transparent maze -> shoots back & bonks forehead!
  {
    t: 6.0,
    p: {
      lean: 0.12,
      hipDrop: 8,
      pointR: false,
      brow: 'determined',
      mouth: 'smirk',
      look: 'right',
      handL: { x: 64, y: 1035 },
      handR: { x: 122, y: 1045 },
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 7.8,
    p: {
      lean: 0.15,
      hipDrop: 12,
      brow: 'determined',
      mouth: 'grin',
      handL: { x: 70, y: 895 },
      handR: { x: 128, y: 895 },
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 9.0,
    p: {
      lean: 0.2,
      hipDrop: 16,
      brow: 'angry',
      mouth: 'grit',
      handL: { x: 74, y: 850 },
      handR: { x: 132, y: 850 },
    },
  },
  // Forehead bonk at 9.95s!
  {
    t: 9.95,
    p: {
      lean: -0.22,
      headTilt: -0.22,
      headDrop: 14,
      eye: 'shut',
      brow: 'angry',
      mouth: 'o',
      gripL: false,
      gripR: false,
      handL: { x: -64, y: 920 },
      handR: { x: 64, y: 920 },
    },
  },
  {
    t: 10.75,
    p: {
      lean: 0.04,
      headTilt: 0.05,
      headDrop: 4,
      eye: 'squint',
      brow: 'angry',
      mouth: 'grit',
      handL: { x: -82, y: 1120 },
      handR: { x: 82, y: 1120 },
      fistL: true,
      fistR: true,
    },
  },

  // Scene 3: Adds 4 magnets under maze -> guides ball skillfully & runs excitedly
  {
    t: 12.15,
    p: {
      lean: 0.16,
      hipDrop: 14,
      headTilt: 0.06,
      headDrop: 0,
      eye: 'open',
      brow: 'determined',
      mouth: 'grin',
      fistL: false,
      fistR: false,
      handL: { x: -68, y: 1185 },
      handR: { x: 120, y: 1135 },
      gripR: true,
    },
  },
  {
    t: 14.1,
    p: {
      lean: 0.12,
      hipDrop: 4,
      brow: 'cocky',
      mouth: 'bigsmile',
      look: 'right',
      gripR: false,
      handL: { x: -86, y: 1060 },
      handR: { x: 118, y: 1015 },
      pointR: true,
    },
  },
  {
    t: 16.0,
    p: {
      lean: 0.14,
      hipDrop: 2,
      brow: 'cocky',
      mouth: 'bigsmile',
      look: 'up',
      pointR: false,
      handL: { x: -88, y: 1010 },
      handR: { x: 105, y: 950 },
      fistR: true,
    },
  },

  // Scene 4: Final magnet above cup -> watches spinning obstacle -> holds breath
  {
    t: 18.2,
    p: {
      lean: 0.14,
      hipDrop: 8,
      look: 'up',
      brow: 'determined',
      mouth: 'grin',
      handL: { x: -70, y: 1090 },
      handR: { x: 128, y: 985 },
      pointR: true,
      fistR: false,
    },
  },
  {
    t: 20.8,
    p: {
      lean: 0.08,
      hipDrop: 18,
      crouch: 0.3,
      look: 'right',
      eye: 'wide',
      brow: 'raised',
      mouth: 'o',
      pointR: false,
      handL: { x: -42, y: 1085 },
      handR: { x: 56, y: 1085 },
      fistL: true,
      fistR: true,
    },
  },
  {
    t: 22.8,
    p: {
      lean: 0.05,
      hipDrop: 24,
      crouch: 0.35,
      look: 'right',
      eye: 'squint',
      brow: 'determined',
      mouth: 'grit',
      handL: { x: -38, y: 1110 },
      handR: { x: 52, y: 1110 },
    },
  },

  // Scene 5: Ball scores! Victory dance -> magnets overload -> beanie flies off -> metal chair slams back!
  {
    t: 24.15,
    p: {
      lean: -0.04,
      hipDrop: 0,
      crouch: 0,
      look: 'right',
      eye: 'happy',
      brow: 'raised',
      mouth: 'bigsmile',
      fistL: false,
      fistR: false,
      handL: { x: -115, y: 940 },
      handR: { x: 115, y: 940 },
      bendL: -1,
      bendR: -1,
    },
  },
  // All magnets activate at 25.80s -> sudden shock!
  {
    t: 25.85,
    p: {
      lean: -0.06,
      headTilt: -0.08,
      look: 'up',
      eye: 'wide',
      brow: 'raised',
      mouth: 'o',
      handL: { x: -102, y: 1060 },
      handR: { x: 102, y: 1060 },
    },
  },
  // Red beanie flies off at 26.35s!
  {
    t: 26.35,
    p: {
      beanieOn: false,
      lean: 0.04,
      headTilt: -0.14,
      look: 'up',
      eye: 'wide',
      brow: 'raised',
      mouth: 'o',
      handL: { x: -54, y: 925 },
      handR: { x: 64, y: 925 },
    },
  },
  // Giant metal chair slams onto his back at 27.65s!
  {
    t: 27.65,
    p: {
      beanieOn: false,
      lean: 0.24,
      hipDrop: 24,
      crouch: 0.38,
      headTilt: 0.06,
      headDrop: 10,
      look: 'left',
      eye: 'wide',
      brow: 'angry',
      mouth: 'grit',
      handL: { x: -84, y: 1215 },
      handR: { x: 96, y: 1185 },
      fistL: true,
      fistR: true,
    },
  },
  {
    t: 28.8,
    p: {
      beanieOn: false,
      lean: 0.22,
      hipDrop: 20,
      crouch: 0.34,
      headTilt: 0.04,
      headDrop: 8,
      look: 'center',
      eye: 'squint',
      brow: 'uneven',
      mouth: 'frown',
      handL: { x: -78, y: 1225 },
      handR: { x: 92, y: 1200 },
    },
  },
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
  { from: 0.25, to: 5.75, text: 'I CAN CONTROL THE BALL!' },
  { from: 6.25, to: 11.75, text: 'TOO MUCH POWER!' },
  { from: 12.25, to: 17.75, text: 'MAGNETIC CONTROL!' },
  { from: 18.25, to: 23.75, text: "DON'T LOSE CONTROL!" },
  { from: 24.25, to: 29.85, text: 'EVERYTHING IS MAGNETIC! 😂' },
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
  ground: number;
  lift: number;
  walkPhase: number;
}

interface BallState {
  x: number;
  y: number;
  rot: number;
}

export class MagneticMazeRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const camX = this.cameraXAt(time);
    const ch = this.charAt(time);
    const pose = this.poseAt(time, ch.walkPhase);
    const ball = this.ballAt(time);

    ctx.save();
    ctx.translate(-camX, 0);

    // 1. Lab Backdrop & Floor
    this.drawLabBackdrop(ctx);

    // 2. Scene 1 Table (fades cleanly or sits left when panning right)
    if (time < 6.4) {
      this.drawTable(ctx);
    }

    // 3. Transparent Maze, Tunnel, Vertical Wall, Ramps, Spinning Obstacle & Golden Cup Back
    this.drawCourseProps(ctx, time);

    // 4. All Horseshoe Magnets & Active Magnetic Field Waves
    this.drawMagnets(ctx, time, ch);

    // 5. Scene 5 Flying Beanie (detached at 26.35s) & Room Metal Chaos
    this.drawMagneticTwistProps(ctx, time, ch);

    // 6. Silver Metal Ball
    this.drawSilverBall(ctx, ball.x, ball.y, ball.rot);

    // 7. Golden Cup Front Rim (so ball drops cleanly inside)
    if (time >= 17.2) {
      this.drawGoldenCupFront(ctx, 1440, 1285, time);
    }

    // 8. Stickman + Forehead Impact Bump + Giant Metal Chair Stuck to His Back!
    this.drawCharacter(ctx, ch, pose, time);
    this.drawHeadBumpAndChair(ctx, ch, pose, time);

    // 9. Victory Confetti & Impact Sparks
    this.drawFX(ctx, time, ball);

    ctx.restore();

    // 10. Screen-space captions & optional safe zones
    if (config.showCaptions) {
      this.drawCaptions(ctx, time);
    }
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Camera Panning (frames Scene 1–2 left, Scene 3 maze->wall, Scene 4–5 wall->cup!)
  // -------------------------------------------------------------------------
  private cameraXAt(t: number): number {
    if (t < 11.8) return 0;
    if (t < 14.5) return lerp(0, 190, easeInOut(inv(11.8, 14.5, t)));
    if (t < 17.8) return lerp(190, 480, easeInOut(inv(14.5, 17.8, t)));
    return 480;
  }

  // -------------------------------------------------------------------------
  // Character Position Timeline
  // -------------------------------------------------------------------------
  private charAt(t: number): CharState {
    let x = 235;
    let lift = 0;
    let walkPhase = 0;

    if (t < 6.0) {
      x = 235;
    } else if (t < 11.8) {
      x = 215;
      if (t >= 9.95 && t < 10.6) {
        const u = inv(9.95, 10.6, t);
        x = lerp(215, 190, Math.sin(u * Math.PI));
      }
    } else if (t < 14.2) {
      const u = easeInOut(inv(11.8, 14.2, t));
      x = lerp(215, 360, u);
      walkPhase = u * 4;
    } else if (t < 17.8) {
      const u = easeInOut(inv(14.2, 17.8, t));
      x = lerp(360, 740, u);
      walkPhase = u * 8;
    } else if (t < 20.5) {
      const u = easeInOut(inv(17.8, 20.5, t));
      x = lerp(740, 1030, u);
      walkPhase = u * 6;
    } else if (t < 24.15) {
      x = 1030;
    } else if (t < 25.75) {
      // Celebrates near cup!
      const u = inv(24.15, 25.75, t);
      x = lerp(1030, 1075, easeOut(clamp(u * 2, 0, 1)));
      lift = Math.abs(Math.sin(u * Math.PI * 3.5)) * 68;
    } else {
      x = 1075;
      if (t >= 27.65 && t < 28.05) {
        // Chair slams back -> small recoil jolt
        const u = inv(27.65, 28.05, t);
        x = lerp(1075, 1098, easeOut(u));
      } else if (t >= 28.05) {
        x = 1098;
      }
    }

    return { x, ground: FLOOR_Y, lift, walkPhase };
  }

  private poseAt(t: number, walkPhase: number): Pose {
    let idx = 0;
    for (let i = 0; i < POSE_KEYS.length; i++) {
      if (t >= POSE_KEYS[i].t) idx = i;
    }
    const cur = POSE_KEYS[idx];
    const next = POSE_KEYS[Math.min(POSE_KEYS.length - 1, idx + 1)];
    const span = Math.max(0.01, next.t - cur.t);
    const u = idx === POSE_KEYS.length - 1 ? 0 : easeInOut(clamp((t - cur.t) / span, 0, 1));
    const step = (k: PoseKey, n: PoseKey) => lerp(k.hipDrop, n.hipDrop, u);

    const walkLift = walkPhase > 0 ? Math.abs(Math.sin(walkPhase * Math.PI)) * 34 : 0;
    const walkStance = walkPhase > 0 ? 14 + Math.sin(walkPhase * Math.PI) * 24 : lerp(cur.stance, next.stance, u);

    return {
      ...cur,
      lean: lerp(cur.lean, next.lean, u),
      hipDrop: step(cur, next),
      crouch: lerp(cur.crouch, next.crouch, u),
      sit: lerp(cur.sit, next.sit, u),
      headTilt: lerp(cur.headTilt, next.headTilt, u),
      headTurn: lerp(cur.headTurn, next.headTurn, u),
      headDrop: lerp(cur.headDrop, next.headDrop, u),
      stance: walkStance,
      footLift: Math.max(lerp(cur.footLift, next.footLift, u), walkLift),
      handL: { x: lerp(cur.handL.x, next.handL.x, u), y: lerp(cur.handL.y, next.handL.y, u) },
      handR: { x: lerp(cur.handR.x, next.handR.x, u), y: lerp(cur.handR.y, next.handR.y, u) },
    };
  }

  // -------------------------------------------------------------------------
  // Continuous Silver Ball Timeline (0–30s, magnet-driven, zero teleporting!)
  // -------------------------------------------------------------------------
  private ballAt(t: number): BallState {
    // Scene 1: Held in hand -> placed on table (320, 1121) -> pulled onto Red Magnet (486, 1085)
    if (t < 1.15) {
      const u = easeInOut(inv(0.0, 1.15, t));
      return { x: lerp(260, 320, u), y: lerp(1125, 1121, u), rot: 0 };
    }
    if (t < 2.25) {
      return { x: 320, y: 1121, rot: 0 };
    }
    if (t < 2.75) {
      const u = inv(2.25, 2.75, t);
      const accel = u * u;
      return {
        x: lerp(320, 486, accel),
        y: lerp(1121, 1085, accel),
        rot: accel * 4.5,
      };
    }
    if (t < 6.0) {
      // Stuck firmly onto Red Horseshoe Magnet poles!
      return { x: 486, y: 1085, rot: 4.5 };
    }

    // Scene 2: Inside Transparent Maze (x=400..720, y=720..1110) -> pulled left/right -> shoots back into forehead!
    if (t < 6.85) {
      const u = easeInOut(inv(6.0, 6.85, t));
      return { x: lerp(486, 420, u), y: lerp(1085, 1068, u), rot: 4.5 - u * 2 };
    }
    if (t < 7.8) {
      const u = easeInOut(inv(6.85, 7.8, t));
      return { x: lerp(420, 560, u), y: lerp(1068, 965, u), rot: 2.5 + u * 3 };
    }
    if (t < 8.8) {
      const u = easeInOut(inv(7.8, 8.8, t));
      return { x: lerp(560, 705, u), y: lerp(965, 860, u), rot: 5.5 + u * 3.5 };
    }
    if (t < 9.45) {
      // Shakes fiercely between overpowered Blue and Red magnets
      return { x: 705 + Math.sin(t * 60) * 6, y: 860 + Math.cos(t * 50) * 5, rot: 9.0 };
    }
    if (t < 9.95) {
      // Repelled backward straight out left gap into Stickman's forehead (x=215, y=882)!
      const u = inv(9.45, 9.95, t);
      return {
        x: lerp(705, 218, u),
        y: lerp(860, 882, u) - Math.sin(u * Math.PI) * 55,
        rot: 9.0 - u * 12,
      };
    }
    if (t < 11.8) {
      // Bounces off forehead onto floor
      const u = clamp((t - 9.95) / 0.65, 0, 1);
      const x = lerp(218, 345, u);
      const y = lerp(882, FLOOR_Y - BALL_R, u * u);
      return { x, y, rot: -3 - u * 4 };
    }

    // Scene 3: Enters upgraded maze (11.8–12.9s) -> 4 bottom magnets guide sharp corners -> tunnel -> vertical wall climb!
    if (t < 12.9) {
      const u = easeInOut(inv(11.8, 12.9, t));
      return { x: lerp(345, 420, u), y: lerp(FLOOR_Y - BALL_R, 1068, u), rot: u * 4 };
    }
    if (t < 13.55) {
      const u = easeInOut(inv(12.9, 13.55, t));
      return { x: lerp(420, 560, u), y: 1068, rot: 4 + u * 3 };
    }
    if (t < 14.1) {
      const u = easeInOut(inv(13.55, 14.1, t));
      return { x: 560, y: lerp(1068, 930, u), rot: 7 + u * 2.5 };
    }
    if (t < 14.7) {
      const u = easeInOut(inv(14.1, 14.7, t));
      return { x: lerp(560, 720, u), y: 930, rot: 9.5 + u * 3 };
    }
    if (t < 15.85) {
      // Curved magnetic tunnel U-loop from (720, 930) -> (945, 955)
      const u = easeInOut(inv(14.7, 15.85, t));
      const ang = lerp(Math.PI, 0, u);
      return {
        x: 832 + Math.cos(ang) * 112,
        y: 942 + Math.sin(ang) * 98,
        rot: 12.5 + u * 6,
      };
    }
    if (t < 18.0) {
      // Climbs straight up the vertical metal wall (x=945, y=942 -> y=515)!
      const u = easeInOut(inv(15.85, 18.0, t));
      return { x: 945, y: lerp(942, 515, u), rot: 18.5 + u * 7 };
    }

    // Scene 4: Clears vertical wall ramp -> flies across gap -> orbits spinning obstacle -> drops toward golden cup!
    if (t < 19.05) {
      const u = easeInOut(inv(18.0, 19.05, t));
      return { x: lerp(945, 1020, u), y: lerp(515, 485, u), rot: 25.5 + u * 3 };
    }
    if (t < 20.55) {
      // Flies across gap toward spinning obstacle entry (1280 - 125 = 1155, 720)
      const u = easeInOut(inv(19.05, 20.55, t));
      return {
        x: lerp(1020, 1155, u),
        y: lerp(485, 720, u) - Math.sin(u * Math.PI) * 58,
        rot: 28.5 + u * 6,
      };
    }
    if (t < 22.55) {
      // Circles spinning obstacle at (1280, 720) radius 125!
      const u = easeInOut(inv(20.55, 22.55, t));
      const ang = Math.PI + u * TAU * 1.08;
      return {
        x: 1280 + Math.cos(ang) * 125,
        y: 720 + Math.sin(ang) * 125,
        rot: 34.5 + u * 9,
      };
    }
    if (t < 23.35) {
      // Pulled up to final Blue Horseshoe Magnet above the cup (1440, 565)
      const u = easeInOut(inv(22.55, 23.35, t));
      return {
        x: lerp(1388, 1440, u),
        y: lerp(780, 565, u),
        rot: 43.5 + u * 3,
      };
    }
    if (t < 24.15) {
      // Drops straight into tiny Golden Target Cup at (1440, 1235)!
      const u = inv(23.35, 24.15, t);
      return {
        x: 1440,
        y: lerp(565, 1245, u * u),
        rot: 46.5 + u * 2,
      };
    }

    // Scene 5: Inside Golden Cup (24.15–25.8s), then pulled out with other metal objects toward Stickman (1098, 1080)
    if (t < 26.2) {
      return { x: 1440, y: 1245, rot: 48.5 };
    }
    if (t < 27.6) {
      const u = easeInOut(inv(26.2, 27.6, t));
      return {
        x: lerp(1440, 1138, u),
        y: lerp(1245, 1140, u) - Math.sin(u * Math.PI) * 95,
        rot: 48.5 - u * 8,
      };
    }
    // Stuck right onto Stickman's chest/metal chaos cluster!
    return { x: 1138, y: 1140, rot: 40.5 };
  }

  // -------------------------------------------------------------------------
  // Background & Table
  // -------------------------------------------------------------------------
  private drawLabBackdrop(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = LAB_WALL;
    ctx.fillRect(-100, 0, 2100, FLOOR_Y);

    ctx.fillStyle = LAB_BAND;
    ctx.fillRect(-100, 260, 2100, 130);

    // Subtle wall lab panel lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    for (let x = 0; x <= 1900; x += 280) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, FLOOR_Y);
      ctx.stroke();
    }

    // Floor slab
    ctx.fillStyle = FLOOR_TILE;
    ctx.fillRect(-100, FLOOR_Y, 2100, HEIGHT - FLOOR_Y);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-100, FLOOR_Y);
    ctx.lineTo(2000, FLOOR_Y);
    ctx.stroke();

    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 4;
    for (let x = -40; x <= 1900; x += 180) {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR_Y);
      ctx.lineTo(x - 60, HEIGHT);
      ctx.stroke();
    }
  }

  private drawTable(ctx: CanvasRenderingContext2D) {
    // Sleek steel lab table for Scene 1 (x = 220..610, topY = 1140)
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    for (const lx of [255, 560]) {
      ctx.beginPath();
      ctx.rect(lx, 1165, 24, FLOOR_Y - 1165);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = METAL_LIGHT;
    ctx.beginPath();
    ctx.roundRect(220, 1140, 390, 32, 8);
    ctx.fill();
    ctx.stroke();
  }

  // -------------------------------------------------------------------------
  // Course Props: Transparent Maze, Tunnel, Vertical Wall, Ramps, Spinner, Golden Cup
  // -------------------------------------------------------------------------
  private drawCourseProps(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 5.95) return;

    // 1. Transparent Acrylic Maze (x = 370..750, y = 700..1130)
    const mazeAlpha = clamp(inv(5.95, 6.45, t), 0, 1);
    ctx.save();
    ctx.globalAlpha = mazeAlpha;

    // Maze pedestal legs
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    for (const lx of [395, 705]) {
      ctx.beginPath();
      ctx.rect(lx, 1130, 22, FLOOR_Y - 1130);
      ctx.fill();
      ctx.stroke();
    }

    // Glass box body
    ctx.fillStyle = MAZE_GLASS;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(370, 700, 380, 430, 16);
    ctx.fill();
    ctx.stroke();

    // Inner transparent shelves/channels
    ctx.strokeStyle = MAZE_EDGE;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Bottom track
    ctx.moveTo(390, 1094);
    ctx.lineTo(645, 1094);
    // Middle shelf
    ctx.moveTo(505, 960);
    ctx.lineTo(735, 960);
    // Upper shelf
    ctx.moveTo(395, 830);
    ctx.lineTo(665, 830);
    ctx.stroke();

    // Glass specular streaks
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(400, 735);
    ctx.lineTo(445, 780);
    ctx.moveTo(660, 745);
    ctx.lineTo(710, 795);
    ctx.stroke();
    ctx.restore();

    // 2. Curved Magnetic Tunnel & Vertical Metal Wall (Scenes 3–5, x = 750..975)
    if (t >= 11.8) {
      const u = clamp(inv(11.8, 12.4, t), 0, 1);
      ctx.save();
      ctx.globalAlpha = u;

      // Curved transparent U-tunnel
      ctx.strokeStyle = INK;
      ctx.lineWidth = 52;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(832, 942, 112, 0, Math.PI, false);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(186, 230, 253, 0.72)';
      ctx.lineWidth = 40;
      ctx.beginPath();
      ctx.arc(832, 942, 112, 0, Math.PI, false);
      ctx.stroke();

      // Tall Vertical Metal Wall & Top Lip Ramp (x = 945..1030, y = 475..1520)
      ctx.fillStyle = METAL_MID;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(962, 480, 32, FLOOR_Y - 480, 8);
      ctx.fill();
      ctx.stroke();

      // Angled Metal Launch Ramp at top of vertical wall
      ctx.fillStyle = METAL_LIGHT;
      ctx.beginPath();
      ctx.moveTo(955, 515);
      ctx.lineTo(1038, 482);
      ctx.lineTo(1038, 504);
      ctx.lineTo(955, 535);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // 3. Scene 4–5 Spinning Metal Obstacle & Golden Target Cup Pedestal
    if (t >= 17.2) {
      const spinAngle = t * 3.1;
      ctx.save();
      ctx.translate(1280, 720);
      ctx.rotate(spinAngle);
      ctx.fillStyle = METAL_LIGHT;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 2);
        ctx.beginPath();
        ctx.roundRect(-12, -88, 24, 176, 10);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = MAG_RED;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Golden Target Cup Pedestal & Cup Back
      ctx.fillStyle = METAL_DARK;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(1408, 1285, 64, FLOOR_Y - 1285, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = GOLD_DEEP;
      ctx.beginPath();
      ctx.ellipse(1440, 1218, 30, 9, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
  }

  private drawGoldenCupFront(ctx: CanvasRenderingContext2D, cx: number, bottomY: number, t: number) {
    const glow = t >= 24.15 && t < 25.8;
    ctx.save();
    if (glow) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, bottomY - 34, 54, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = GOLD_CUP;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 30, bottomY - 68);
    ctx.lineTo(cx + 30, bottomY - 68);
    ctx.lineTo(cx + 22, bottomY);
    ctx.lineTo(cx - 22, bottomY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 22, bottomY - 61);
    ctx.lineTo(cx + 22, bottomY - 61);
    ctx.stroke();
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Horseshoe Magnets (Consistent Red & Blue U-Shapes + Magnetic Waves)
  // -------------------------------------------------------------------------
  private drawHorseshoeMagnet(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    scale: number,
    color: 'red' | 'blue',
    active: boolean,
    t: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    // Outer U body
    const main = color === 'red' ? MAG_RED : MAG_BLUE;
    const deep = color === 'red' ? MAG_RED_DEEP : MAG_BLUE_DEEP;

    // Magnetic waves emitting from open poles (+X direction)
    if (active) {
      ctx.strokeStyle = FIELD_CYAN;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const phase = ((t * 3.5 + i * 0.33) % 1);
        ctx.save();
        ctx.globalAlpha = 1 - phase;
        ctx.beginPath();
        ctx.arc(38 + phase * 38, 0, 22 + phase * 18, -0.75, 0.75);
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.strokeStyle = INK;
    ctx.lineWidth = 34;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.arc(0, 0, 34, Math.PI * 0.5, Math.PI * 1.5, false);
    ctx.moveTo(0, -34);
    ctx.lineTo(38, -34);
    ctx.moveTo(0, 34);
    ctx.lineTo(38, 34);
    ctx.stroke();

    ctx.strokeStyle = main;
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.arc(0, 0, 34, Math.PI * 0.5, Math.PI * 1.5, false);
    ctx.moveTo(0, -34);
    ctx.lineTo(24, -34);
    ctx.moveTo(0, 34);
    ctx.lineTo(24, 34);
    ctx.stroke();

    // Inner depth highlight
    ctx.strokeStyle = deep;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 26, Math.PI * 0.65, Math.PI * 1.35, false);
    ctx.stroke();

    // Silver Pole Tips
    ctx.fillStyle = MAG_TIP;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    for (const py of [-34, 34]) {
      ctx.beginPath();
      ctx.rect(20, py - 14, 22, 28);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawMagnets(ctx: CanvasRenderingContext2D, t: number, ch: CharState) {
    const allSurge = t >= 25.8;

    // Scene 1: Giant Red Horseshoe Magnet on right side of table (facing left)
    if (t < 6.2) {
      const active = t >= 1.95 && t < 5.9;
      this.drawHorseshoeMagnet(ctx, 535, 1085, Math.PI, 1.05, 'red', active, t);
    }

    // Scene 2: Two giant magnets on opposite sides of transparent maze
    if (t >= 6.0 && t < 12.1) {
      const leftY = t < 7.8 ? lerp(1060, 955, inv(6.0, 7.8, t)) : t < 9.5 ? lerp(955, 865, inv(7.8, 9.5, t)) : 865;
      const rightY = t < 8.8 ? lerp(1020, 860, inv(6.0, 8.8, t)) : 860;
      const shake = t >= 8.95 && t < 9.55 ? Math.sin(t * 75) * 6 : 0;
      this.drawHorseshoeMagnet(ctx, 305 + shake, leftY, 0, 0.96, 'blue', t >= 6.8 && t < 9.6, t);
      this.drawHorseshoeMagnet(ctx, 815 - shake, rightY, Math.PI, 0.96, 'red', t >= 7.7 && t < 9.6, t);
    }

    // Scene 3–5: Four alternating Red/Blue magnets beneath the maze (facing up)
    if (t >= 12.1) {
      const xs = [435, 535, 640, 745];
      xs.forEach((mx, i) => {
        const isRed = i % 2 === 0;
        const active =
          allSurge ||
          (t >= 12.9 + i * 0.55 && t <= 14.3 + i * 0.55);
        const bob = active ? Math.sin(t * 10 + i) * 6 : 0;
        this.drawHorseshoeMagnet(ctx, mx, 1192 + bob, -Math.PI / 2, 0.72, isRed ? 'red' : 'blue', active, t);
      });

      // Vertical Wall Guide Red Magnet (facing left toward wall)
      const wallActive = allSurge || (t >= 15.8 && t < 18.8);
      const wallY = t < 18.0 ? lerp(940, 515, easeInOut(inv(15.85, 18.0, t))) : 515;
      this.drawHorseshoeMagnet(ctx, 1045, wallY, Math.PI, 0.78, 'red', wallActive, t);

      // Handheld mini steering magnet in Stickman's right hand during Scene 3
      if (t >= 12.5 && t < 18.0) {
        this.drawHorseshoeMagnet(ctx, ch.x + 115, 955, -0.45, 0.52, 'blue', true, t);
      }
    }

    // Scene 4–5: Final Overhead Blue Horseshoe Magnet above the Golden Cup!
    if (t >= 18.0) {
      const overheadActive = allSurge || (t >= 20.4 && t < 23.45);
      this.drawHorseshoeMagnet(ctx, 1440, 445, Math.PI / 2, 1.05, 'blue', overheadActive, t);
    }
  }

  // -------------------------------------------------------------------------
  // Scene 5 Twist Props: Red Beanie Flying Off + Metal Objects Converging
  // -------------------------------------------------------------------------
  private drawMagneticTwistProps(ctx: CanvasRenderingContext2D, t: number, ch: CharState) {
    // 1. Flying Red Beanie (26.35s onward -> sticks onto overhead magnet at (1440, 505)!)
    if (t >= 26.35) {
      const u = easeInOut(inv(26.35, 27.15, t));
      const bx = lerp(ch.x, 1440, u);
      const by = lerp(1025, 505, u) - Math.sin(u * Math.PI) * 95;
      const rot = lerp(0, Math.PI * 0.85, u);
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(rot);
      this.drawBeanieShape(ctx);
      ctx.restore();
    }

    // 2. Small room metal objects flying onto Stickman (wrench, metal lamp, bolts, tray)
    if (t >= 26.1) {
      const items = [
        { sx: 620, sy: 1470, ex: ch.x + 48, ey: 1210, rot: 0.4, kind: 'wrench' as const },
        { sx: 1520, sy: 1475, ex: ch.x - 42, ey: 1245, rot: -0.6, kind: 'bolt' as const },
        { sx: 1380, sy: 1480, ex: ch.x + 36, ey: 1300, rot: 0.8, kind: 'bolt' as const },
      ];
      items.forEach((item, idx) => {
        const u = easeInOut(inv(26.15 + idx * 0.25, 27.75 + idx * 0.25, t));
        const x = lerp(item.sx, item.ex, u);
        const y = lerp(item.sy, item.ey, u) - Math.sin(u * Math.PI) * 110;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(lerp(0, item.rot, u));
        ctx.fillStyle = METAL_LIGHT;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 4;
        if (item.kind === 'wrench') {
          ctx.beginPath();
          ctx.roundRect(-28, -7, 56, 14, 6);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(-28, 0, 12, 0, TAU);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, 12, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      });
    }
  }

  private drawHeadBumpAndChair(ctx: CanvasRenderingContext2D, ch: CharState, pose: Pose, t: number) {
    // Scene 2 comical red forehead bump after bonk (9.95–11.8s)
    if (t >= 9.95 && t < 11.8) {
      const grow = easeOut(inv(9.95, 10.25, t));
      const baseY = ch.ground - ch.lift;
      const hipY = baseY - 260 + pose.hipDrop + pose.crouch * 52;
      const shoulderY = hipY - 170;
      const headCx = ch.x + Math.sin(pose.lean) * 170 + Math.sin(pose.headTilt) * 12;
      const headCy = shoulderY - 20 - HEAD_R + pose.headDrop;
      ctx.save();
      ctx.translate(headCx + 42, headCy - 30);
      ctx.fillStyle = MAG_RED;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 16 * grow, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Scene 5: Giant Metal Chair flies from right side and STICKS to Stickman's back (26.85–30.0s)!
    if (t >= 26.85) {
      const u = easeInOut(inv(26.85, 27.65, t));
      const cx = lerp(1580, ch.x - 76, u);
      const cy = lerp(1410, 1185, u) - Math.sin(u * Math.PI) * 145;
      const rot = lerp(0.15, -0.32, u);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = METAL_MID;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5.5;

      // Chair backrest & seat
      ctx.beginPath();
      ctx.roundRect(-24, -145, 22, 165, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = METAL_LIGHT;
      ctx.beginPath();
      ctx.roundRect(-24, 5, 118, 22, 8);
      ctx.fill();
      ctx.stroke();

      // Chair metal legs
      ctx.strokeStyle = INK;
      ctx.lineWidth = 11;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-14, 27);
      ctx.lineTo(-22, 128);
      ctx.moveTo(80, 27);
      ctx.lineTo(88, 128);
      ctx.stroke();

      ctx.strokeStyle = METAL_DARK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-14, 27);
      ctx.lineTo(-22, 128);
      ctx.moveTo(80, 27);
      ctx.lineTo(88, 128);
      ctx.stroke();

      ctx.restore();
    }
  }

  private drawSilverBall(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    const grad = ctx.createRadialGradient(-6, -6, 3, 0, 0, BALL_R);
    grad.addColorStop(0, WHITE);
    grad.addColorStop(0.55, METAL_LIGHT);
    grad.addColorStop(1, METAL_DARK);

    ctx.fillStyle = grad;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Crisp metallic specular crescent
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.ellipse(-6, -6, 5.5, 3.2, -0.6, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private drawFX(ctx: CanvasRenderingContext2D, t: number, _ball: BallState) {
    // Scene 1 Idea Sparkle (3.85–4.75s)
    if (t >= 3.85 && t < 4.75) {
      const u = inv(3.85, 4.75, t);
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = GOLD_CUP;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI * 0.85 + (i * Math.PI * 0.7) / 4;
        ctx.beginPath();
        ctx.moveTo(235 + Math.cos(a) * 100, 960 + Math.sin(a) * 100);
        ctx.lineTo(235 + Math.cos(a) * (128 + u * 24), 960 + Math.sin(a) * (128 + u * 24));
        ctx.stroke();
      }
      ctx.restore();
    }

    // Scene 5 Victory Confetti (24.15–25.75s)
    if (t >= 24.15 && t < 25.75) {
      const u = inv(24.15, 25.75, t);
      const colors = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU + 0.25;
        const px = 1440 + Math.cos(a) * (25 + u * 155);
        const py = 1205 + Math.sin(a) * (20 + u * 105) - u * 45 + u * u * 110;
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.rect(px - 6, py - 5, 12, 10);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Scene 5 All-Magnets Overload Electric Bolts (25.8–29.9s)
    if (t >= 25.8) {
      const pulse = Math.abs(Math.sin(t * 16));
      ctx.save();
      ctx.globalAlpha = 0.45 + pulse * 0.45;
      ctx.strokeStyle = FIELD_CYAN;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      for (const bx of [1025, 1165]) {
        ctx.beginPath();
        ctx.moveTo(bx, 1110);
        ctx.lineTo(bx + (bx < 1100 ? -18 : 18), 1140);
        ctx.lineTo(bx + (bx < 1100 ? -6 : 6), 1165);
        ctx.lineTo(bx + (bx < 1100 ? -24 : 24), 1195);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // -------------------------------------------------------------------------
  // Locked Angry Stickman Rig
  // -------------------------------------------------------------------------
  private drawCharacter(ctx: CanvasRenderingContext2D, ch: CharState, pose: Pose, t: number) {
    const baseY = ch.ground - ch.lift;
    const hipY = baseY - 260 + pose.hipDrop + pose.crouch * 52 + pose.sit * 44;
    const shoulderY = hipY - 170;
    const bodyTopX = ch.x + Math.sin(pose.lean) * 170;
    const headCx = bodyTopX + Math.sin(pose.headTilt) * 12;
    const headCy = shoulderY - 20 - HEAD_R + pose.headDrop;
    const arms = this.computeArms(pose, ch.x, hipY, t);

    this.drawBody(ctx, ch.x, hipY, baseY, pose, arms);
    this.drawHead(ctx, headCx, headCy, pose);
  }

  private drawBody(
    ctx: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    baseY: number,
    pose: Pose,
    arms: { l: Arm; r: Arm }
  ) {
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(pose.lean) * 170;
    const stance = pose.stance;
    const ankleBase = baseY - 16;
    const kneeBend = Math.max(0, pose.hipDrop) * 0.3;

    const standKneeL = { x: hipX - 24 - stance * 0.4, y: hipY + 86 + kneeBend };
    const standKneeR = { x: hipX + 24 + stance * 0.4, y: hipY + 86 + kneeBend };
    const standAnkleL = { x: hipX - 40 - stance, y: ankleBase };
    const standAnkleR = { x: hipX + 40 + stance, y: ankleBase - pose.footLift };

    const crouchKneeL = { x: hipX - 66, y: hipY + 52 };
    const crouchKneeR = { x: hipX + 66, y: hipY + 52 };
    const crouchAnkleL = { x: hipX - 46, y: ankleBase };
    const crouchAnkleR = { x: hipX + 46, y: ankleBase };

    const sitKneeL = { x: hipX - 34, y: hipY + 62 };
    const sitKneeR = { x: hipX + 34, y: hipY + 62 };
    const sitAnkleL = { x: hipX - 24, y: hipY + 148 };
    const sitAnkleR = { x: hipX + 24, y: hipY + 148 };

    const mix = (stand: number, crouch: number, sit: number) =>
      lerp(lerp(stand, crouch, pose.crouch), sit, pose.sit);

    const kneeL = {
      x: mix(standKneeL.x, crouchKneeL.x, sitKneeL.x),
      y: mix(standKneeL.y, crouchKneeL.y, sitKneeL.y),
    };
    const kneeR = {
      x: mix(standKneeR.x, crouchKneeR.x, sitKneeR.x),
      y: mix(standKneeR.y, crouchKneeR.y, sitKneeR.y),
    };
    const ankleL = {
      x: mix(standAnkleL.x, crouchAnkleL.x, sitAnkleL.x),
      y: mix(standAnkleL.y, crouchAnkleL.y, sitAnkleL.y),
    };
    const ankleR = {
      x: mix(standAnkleR.x, crouchAnkleR.x, sitAnkleR.x),
      y: mix(standAnkleR.y, crouchAnkleR.y, sitAnkleR.y),
    };

    ctx.strokeStyle = INK;
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(kneeL.x, kneeL.y);
    ctx.lineTo(ankleL.x, ankleL.y);
    ctx.moveTo(kneeR.x, kneeR.y);
    ctx.lineTo(ankleR.x, ankleR.y);
    ctx.stroke();

    const trouser = (knee: Pt) => {
      ctx.beginPath();
      ctx.moveTo(hipX, hipY - 4);
      ctx.lineTo(knee.x, knee.y);
    };
    ctx.strokeStyle = INK;
    ctx.lineWidth = 34;
    trouser(kneeL);
    ctx.stroke();
    trouser(kneeR);
    ctx.stroke();
    ctx.strokeStyle = TROUSER;
    ctx.lineWidth = 25;
    trouser(kneeL);
    ctx.stroke();
    trouser(kneeR);
    ctx.stroke();

    this.drawShoe(ctx, ankleL.x - 4, ankleL.y + 12, lerp(-0.06, -0.25, pose.sit));
    this.drawShoe(
      ctx,
      ankleR.x + 4,
      ankleR.y + 12,
      lerp(pose.footLift > 20 ? -0.24 : 0.06, 0.25, pose.sit)
    );

    ctx.fillStyle = SHIRT;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(hipX - 36, hipY + 10);
    ctx.lineTo(bodyTopX - 40, shoulderY);
    ctx.lineTo(bodyTopX + 40, shoulderY);
    ctx.lineTo(hipX + 36, hipY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = SHIRT_DEEP;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bodyTopX - 19, shoulderY + 13);
    ctx.lineTo(bodyTopX + 19, shoulderY + 13);
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(bodyTopX, shoulderY + 8);
    ctx.lineTo(bodyTopX, shoulderY - 20);
    ctx.stroke();

    const drawLimb = (a: Arm) => {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(a.ex, a.ey);
      ctx.lineTo(a.hx, a.hy);
      ctx.stroke();
    };
    drawLimb(arms.l);
    drawLimb(arms.r);
    this.drawSleeve(ctx, arms.l);
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
      let hy = target.y + (target.y > 950 ? hipShift : 0);
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

    if (pose.beanieOn) this.drawBeanieShape(ctx);

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

  private drawBeanieShape(ctx: CanvasRenderingContext2D) {
    const r = HEAD_R;
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
      ctx.moveTo(i * 23, -70);
      ctx.lineTo(i * 23, -50);
      ctx.stroke();
    }
    ctx.fillStyle = BEANIE_POM;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -r - 33, 16, 0, TAU);
    ctx.fill();
    ctx.stroke();
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
