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

// --- Gravity Lab Studio Palette (Modern Pop 2D Flat Vector) ----------------
const WALL_BG = '#f8fafc';
const WALL_BAND = '#e2e8f0';
const FLOOR_TILE = '#cbd5e1';
const FLOOR_LINE = '#94a3b8';

const METAL_DARK = '#475569';
const METAL_MID = '#64748b';
const PLATFORM_CYAN = '#0ea5e9';
const PLATFORM_DARK = '#0369a1';

const BALL_ORANGE = '#f97316';
const BALL_SEAM = '#7c2d12';

const GOLD_MAIN = '#facc15';
const GOLD_DEEP = '#ca8a04';

const ZONE_BLUE = '#3b82f6';
const ZONE_PURPLE = '#a855f7';
const ZONE_GREEN = '#22c55e';

const FLOOR_Y = 1520;
const CEIL_Y = 280;
const HEAD_R = 70;
const BALL_R = 30;

// --- World Coordinates (Zero Teleportation Across Scenes) ------------------
const WALL_X = 1020;
const WALL_TOP_Y = 540;

const BLUE_ZONE = { x: 795, y: 860, w: 225, h: FLOOR_Y - 860 };
const PURPLE_ZONE = { x: 1020, y: CEIL_Y, w: 365, h: 480 };
const GREEN_ZONE = { x: 1385, y: CEIL_Y, w: 175, h: 700 };

const PLAT_LEFT = { x: 1275, y: 900, w: 120, h: 24 };
const PLAT_RIGHT = { x: 1495, y: 900, w: 110, h: 24 };
const PLAT_LOWER = { x: 1345, y: 1150, w: 160, h: 24, angle: -0.26 };

const NORMAL_HOOP = { rimX: 550, rimY: 790, boardX: 598 };
const GOLDEN_HOOP = { rimX: 1565, rimY: 730, boardX: 1618 };

// --- Deterministic Helpers -------------------------------------------------
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
  headTilt: number;
  headTurn: number;
  headDrop: number;
  beanieDangle: number;
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
  headTilt: 0,
  headTurn: 2,
  headDrop: 0,
  beanieDangle: 0,
  look: 'right',
  mouth: 'smirk',
  brow: 'determined',
  eye: 'open',
  stance: 12,
  footLift: 0,
  handL: { x: -66, y: 1210 },
  handR: { x: 86, y: 1205 },
  bendL: -1,
  bendR: 1,
};

const POSE_PATCHES: { t: number; p: Partial<Pose> }[] = [
  // Scene 1: Throws ball toward Normal Hoop -> ball swerves sideways into wall -> spots Blue Zone!
  { t: 0.0, p: { look: 'right', mouth: 'smirk', brow: 'determined', handL: { x: -58, y: 1225 }, handR: { x: 82, y: 1225 } } },
  { t: 0.9, p: { lean: -0.08, handL: { x: 42, y: 1120 }, handR: { x: 96, y: 1100 }, gripL: true, gripR: true } },
  { t: 1.65, p: { lean: 0.16, gripL: false, gripR: false, mouth: 'grin', handL: { x: -60, y: 1160 }, handR: { x: 132, y: 1005 } } },
  // Shocked as ball slams sideways into wall (2.90s)
  { t: 2.9, p: { lean: -0.1, eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -96, y: 1060 }, handR: { x: 104, y: 1060 } } },
  // Walks closer & leans down pointing at glowing Blue Zone (4.15s)
  { t: 4.15, p: { lean: 0.24, hipDrop: 18, look: 'down', headTilt: 0.14, eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -72, y: 1190 }, handR: { x: 115, y: 1245 }, pointR: true } },

  // Scene 2: Rolls ball into Blue Zone -> watches it climb wall -> points excitedly toward Golden Hoop!
  { t: 6.0, p: { lean: 0.12, hipDrop: 8, look: 'right', headTilt: 0, pointR: false, brow: 'determined', mouth: 'smile', handL: { x: -64, y: 1205 }, handR: { x: 78, y: 1205 } } },
  { t: 7.45, p: { lean: 0.26, hipDrop: 24, crouch: 0.35, look: 'right', handL: { x: -54, y: 1235 }, handR: { x: 105, y: 1410 } } },
  { t: 8.15, p: { lean: 0.06, hipDrop: 0, crouch: 0, look: 'up', eye: 'wide', brow: 'raised', mouth: 'bigsmile', handL: { x: -86, y: 1020 }, handR: { x: 92, y: 1020 } } },
  { t: 10.2, p: { lean: 0.12, look: 'right', eye: 'happy', brow: 'cocky', mouth: 'bigsmile', handL: { x: -76, y: 1110 }, handR: { x: 132, y: 1035 }, pointR: true } },

  // Scene 3: Activates Purple & Green switches -> watches 3-gravity chain -> grins confidently!
  { t: 12.15, p: { lean: -0.06, pointR: false, look: 'up', brow: 'determined', mouth: 'smirk', handL: { x: -82, y: 1065 }, handR: { x: 96, y: 1045 }, pointL: true } },
  { t: 13.45, p: { lean: 0.22, hipDrop: 18, pointL: false, look: 'right', mouth: 'grin', handL: { x: -52, y: 1220 }, handR: { x: 112, y: 1360 } } },
  { t: 14.3, p: { lean: 0.04, hipDrop: 0, look: 'up', eye: 'open', brow: 'raised', mouth: 'smile', handL: { x: -82, y: 1120 }, handR: { x: 94, y: 1070 } } },
  { t: 16.85, p: { lean: 0.02, look: 'right', eye: 'open', brow: 'cocky', mouth: 'bigsmile', handL: { x: -56, y: 1125 }, handR: { x: 58, y: 1125 }, fistL: true, fistR: true } },

  // Scene 4: Releases final impossible shot through all 3 zones -> suspense crouch!
  { t: 18.25, p: { lean: 0.2, hipDrop: 16, fistL: false, fistR: false, brow: 'determined', mouth: 'smirk', handL: { x: -48, y: 1225 }, handR: { x: 96, y: 1365 } } },
  { t: 18.85, p: { lean: 0.08, hipDrop: 0, look: 'up', mouth: 'grin', handL: { x: -72, y: 1145 }, handR: { x: 118, y: 1075 }, pointR: true } },
  { t: 21.6, p: { lean: 0.14, hipDrop: 20, crouch: 0.3, pointR: false, look: 'right', eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -52, y: 1090 }, handR: { x: 64, y: 1090 }, fistL: true, fistR: true } },

  // Scene 5: Ball scores! Celebrates -> ALL 3 gravity zones pull him sideways, flip upside down, stick to ceiling!
  { t: 24.15, p: { lean: 0, hipDrop: 0, crouch: 0, eye: 'happy', brow: 'raised', mouth: 'bigsmile', fistL: false, fistR: false, handL: { x: -115, y: 920 }, handR: { x: 115, y: 920 } } },
  // 25.85s: Pulled sideways!
  { t: 25.85, p: { lean: -0.32, hipDrop: 12, eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -118, y: 1030 }, handR: { x: 96, y: 1055 } } },
  // 26.65s: Floating upside down!
  { t: 26.65, p: { lean: 0.06, hipDrop: 0, beanieDangle: 0.45, eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -120, y: 965 }, handR: { x: 120, y: 965 } } },
  // 27.55s: Stuck flat on the ceiling with red beanie hanging down!
  { t: 27.55, p: { lean: 0.02, hipDrop: 0, beanieDangle: 1.0, look: 'down', eye: 'squint', brow: 'uneven', mouth: 'frown', handL: { x: -86, y: 1185 }, handR: { x: 86, y: 1185 } } },
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
  { from: 0.25, to: 5.75, text: 'GRAVITY IS BROKEN?!' },
  { from: 6.25, to: 11.75, text: 'SIDEWAYS GRAVITY!' },
  { from: 12.25, to: 17.75, text: 'THREE GRAVITIES!' },
  { from: 18.25, to: 23.75, text: 'IMPOSSIBLE TRAJECTORY!' },
  { from: 24.25, to: 29.85, text: 'I FORGOT ABOUT GRAVITY! 😂' },
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
  hipY: number;
  rot: number;
  walkPhase: number;
}

export class TripleGravityRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const camX = this.cameraXAt(time);
    const ch = this.charAt(time);
    const pose = this.poseAt(time, ch.walkPhase);

    ctx.save();
    ctx.translate(-camX, 0);

    // 1. Lab Studio Backdrop + Ceiling + Floor
    this.drawBackdrop(ctx, time);

    // 2. Glowing Gravity Zones (Blue = Sideways, Purple = Upward, Green = Downward)
    this.drawGravityZones(ctx, time);

    // 3. Walls, Floating Platforms, Lab Switches, Normal Hoop & Golden Hoop (Back Layer)
    this.drawCourseArchitecture(ctx, time);

    // 4. Gravity Transition Trails + Orange Basketball
    const ball = this.ballAt(time, ch);
    this.drawGravityTrails(ctx, time);
    this.drawBasketball(ctx, ball.x, ball.y, ball.rot);

    // 5. Stickman Character (with upside-down ceiling hang + dangling red beanie in Scene 5)
    this.drawCharacter(ctx, ch, pose, time);

    // 6. Hoop Front Rims/Nets + Confetti / Surge Overlays
    this.drawHoopFrontsAndFX(ctx, time, ball);

    ctx.restore();

    if (config.showCaptions) {
      this.drawCaptions(ctx, time);
    }
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Camera, Character & Ball Timelines (100% Continuous, Zero Teleports)
  // -------------------------------------------------------------------------
  private cameraXAt(t: number): number {
    if (t < 6.0) return 0;
    if (t < 7.4) return lerp(0, 610, easeInOut(inv(6.0, 7.4, t)));
    return 610;
  }

  private charAt(t: number): CharState {
    let x = 220;
    let hipY = 1260;
    let rot = 0;
    let walkPhase = 0;

    if (t < 3.65) {
      x = 220;
    } else if (t < 5.0) {
      const u = easeInOut(inv(3.65, 5.0, t));
      x = lerp(220, 505, u);
      walkPhase = u * 3;
    } else if (t < 6.0) {
      x = 505;
    } else if (t < 7.4) {
      const u = easeInOut(inv(6.0, 7.4, t));
      x = lerp(505, 735, u);
      walkPhase = u * 3;
    } else if (t < 24.15) {
      x = 735;
      if (t >= 12.1 && t < 13.2) {
        hipY = 1260 - Math.sin(inv(12.1, 13.2, t) * Math.PI) * 14;
      }
    } else if (t < 25.8) {
      // Celebratory jump!
      x = 735;
      const bounce = Math.abs(Math.sin((t - 24.15) * 6.5));
      hipY = 1260 - bounce * 42;
    } else if (t < 26.6) {
      // Pulled sideways by Blue Zone surge!
      const u = easeInOut(inv(25.8, 26.6, t));
      x = lerp(735, 1155, u);
      hipY = 1260;
    } else if (t < 27.55) {
      // Floats upside down & lifts toward Ceiling via Purple Zone surge!
      const u = easeInOut(inv(26.6, 27.55, t));
      x = lerp(1155, 1190, u);
      hipY = lerp(1260, CEIL_Y + 260, u); // CEIL_Y (280) + 260 = 540 => shoes touch CEIL_Y!
      rot = lerp(0, Math.PI, u);
    } else {
      // Stuck upside down against the ceiling!
      x = 1190;
      hipY = CEIL_Y + 260;
      rot = Math.PI;
    }

    return { x, hipY, rot, walkPhase };
  }

  private ballAt(t: number, ch: CharState): { x: number; y: number; rot: number } {
    // Scene 1: Held -> thrown toward Normal Hoop -> enters Blue Zone -> slams Vertical Wall -> floor
    if (t < 0.9) {
      // Dribble bounce beside Stickman
      const bounce = Math.abs(Math.sin(t * 4.5)) * 120;
      return { x: ch.x + 86, y: FLOOR_Y - BALL_R - bounce, rot: t * 2 };
    }
    if (t < 1.65) {
      return { x: ch.x + 76, y: 1105, rot: 1.8 };
    }
    if (t < 2.35) {
      // Thrown toward Normal Hoop (550, 790), dipping past rim toward Blue Zone (x=795)
      const u = inv(1.65, 2.35, t);
      return {
        x: lerp(ch.x + 76, 815, u),
        y: lerp(1105, 920, u) - Math.sin(u * Math.PI) * 340,
        rot: 1.8 + u * 5,
      };
    }
    if (t < 2.9) {
      // Entered Blue Zone -> yanked SIDEWAYS into Vertical Wall (WALL_X - BALL_R = 990)
      const u = easeInOut(inv(2.35, 2.9, t));
      return {
        x: lerp(815, WALL_X - BALL_R, u),
        y: lerp(920, 960, u),
        rot: 6.8 + u * 6,
      };
    }
    if (t < 3.55) {
      // Rebounds off wall & settles on floor at x=870
      const u = easeOut(inv(2.9, 3.55, t));
      return {
        x: lerp(WALL_X - BALL_R, 870, u),
        y: lerp(960, FLOOR_Y - BALL_R, u * u),
        rot: 12.8 - u * 4,
      };
    }
    if (t < 6.75) {
      return { x: 870, y: FLOOR_Y - BALL_R, rot: 8.8 };
    }

    // Scene 2: Stickman picks up ball (6.75-7.65s) -> rolls into Blue Zone -> rolls UP Vertical Wall -> returns
    if (t < 7.65) {
      const u = easeInOut(inv(6.75, 7.65, t));
      return {
        x: lerp(870, ch.x + 95, u),
        y: lerp(FLOOR_Y - BALL_R, 1410, u),
        rot: 8.8 - u * 2,
      };
    }
    if (t < 8.15) {
      const u = inv(7.65, 8.15, t);
      return {
        x: lerp(ch.x + 95, WALL_X - BALL_R, u),
        y: lerp(1410, FLOOR_Y - BALL_R, u),
        rot: 6.8 + u * 4,
      };
    }
    if (t < 10.25) {
      // Pinned by sideways gravity against Vertical Wall, rolling UP along the wall!
      const u = easeOut(inv(8.15, 10.25, t));
      return {
        x: WALL_X - BALL_R,
        y: lerp(FLOOR_Y - BALL_R, 635, u),
        rot: 10.8 - u * 12,
      };
    }
    if (t < 11.45) {
      // Rolls back down wall onto floor and stops by Stickman
      const u = easeInOut(inv(10.25, 11.45, t));
      if (u < 0.72) {
        const w = u / 0.72;
        return {
          x: WALL_X - BALL_R,
          y: lerp(635, FLOOR_Y - BALL_R, w * w),
          rot: -1.2 + w * 9,
        };
      }
      const r = (u - 0.72) / 0.28;
      return {
        x: lerp(WALL_X - BALL_R, ch.x + 95, r),
        y: FLOOR_Y - BALL_R,
        rot: 7.8 - r * 3,
      };
    }
    if (t < 13.65) {
      return { x: ch.x + 95, y: FLOOR_Y - BALL_R, rot: 4.8 };
    }

    // Scene 3: Enters Blue -> Purple -> Green -> suddenly drops onto Upper-Right Floating Platform -> bounces back!
    if (t < 14.05) {
      const u = inv(13.65, 14.05, t);
      return {
        x: lerp(ch.x + 95, WALL_X - BALL_R, u),
        y: FLOOR_Y - BALL_R,
        rot: 4.8 + u * 4,
      };
    }
    if (t < 14.85) {
      // Blue Zone: rolls straight up vertical wall
      const u = inv(14.05, 14.85, t);
      return {
        x: WALL_X - BALL_R,
        y: lerp(FLOOR_Y - BALL_R, WALL_TOP_Y, u),
        rot: 8.8 - u * 8,
      };
    }
    if (t < 15.85) {
      // Purple Zone: lifts upward (-Y) toward ceiling & travels across into Green Zone (x=1545)
      const u = easeInOut(inv(14.85, 15.85, t));
      return {
        x: lerp(WALL_X - BALL_R, 1545, u),
        y: lerp(WALL_TOP_Y, 370, Math.sin(u * Math.PI * 0.78)),
        rot: 0.8 + u * 6,
      };
    }
    if (t < 16.45) {
      // Green Zone: sudden strong downward pull straight onto Upper-Right Floating Platform (y=900)
      const u = inv(15.85, 16.45, t);
      return {
        x: 1545,
        y: lerp(370, PLAT_RIGHT.y - BALL_R, u * u),
        rot: 6.8 + u * 3,
      };
    }
    if (t < 17.2) {
      // Bounces on Floating Platform, rolls left into Narrow Gap & onto Lower Bounce Platform
      const u = inv(16.45, 17.2, t);
      return {
        x: lerp(1545, 1435, u),
        y: lerp(PLAT_RIGHT.y - BALL_R, PLAT_LOWER.y - BALL_R, u) - Math.sin(u * Math.PI) * 75,
        rot: 9.8 - u * 5,
      };
    }
    if (t < 18.25) {
      // Returns cleanly along floor back into Stickman's hands!
      const u = easeInOut(inv(17.2, 18.25, t));
      return {
        x: lerp(1435, ch.x + 95, u),
        y: lerp(PLAT_LOWER.y - BALL_R, FLOOR_Y - BALL_R, easeOut(clamp(u * 1.4, 0, 1))),
        rot: 4.8 - u * 6,
      };
    }
    if (t < 18.65) {
      return { x: ch.x + 95, y: FLOOR_Y - BALL_R, rot: -1.2 };
    }

    // Scene 4: Full 3-Gravity Impossible Trajectory -> climbs wall -> crosses ceiling -> drops through gap -> golden hoop!
    if (t < 19.05) {
      // Rolls into Blue Zone up to Vertical Wall
      const u = inv(18.65, 19.05, t);
      return {
        x: lerp(ch.x + 95, WALL_X - BALL_R, u),
        y: FLOOR_Y - BALL_R,
        rot: -1.2 + u * 4,
      };
    }
    if (t < 20.3) {
      // Climbs Vertical Wall pinned by Blue Zone
      const u = easeInOut(inv(19.05, 20.3, t));
      return {
        x: WALL_X - BALL_R,
        y: lerp(FLOOR_Y - BALL_R, WALL_TOP_Y - 20, u),
        rot: 2.8 - u * 10,
      };
    }
    if (t < 21.85) {
      // Purple Zone pulls up to CEILING (CEIL_Y + BALL_R = 310) and crosses ceiling!
      const u = inv(20.3, 21.85, t);
      const liftU = easeOut(clamp(u / 0.25, 0, 1));
      return {
        x: lerp(WALL_X - BALL_R, 1445, u),
        y: lerp(WALL_TOP_Y - 20, CEIL_Y + BALL_R, liftU),
        rot: -7.2 + u * 12,
      };
    }
    if (t < 22.7) {
      // Green Zone pulls straight DOWN through Narrow Gap (1395..1495) onto Lower Bounce Platform!
      const u = inv(21.85, 22.7, t);
      return {
        x: 1445,
        y: lerp(CEIL_Y + BALL_R, PLAT_LOWER.y - BALL_R, u * u),
        rot: 4.8 + u * 5,
      };
    }
    if (t < 24.15) {
      // Rebounds off Lower Bounce Platform & arcs into Golden Target Hoop (1565, 730)!
      const u = easeInOut(inv(22.7, 24.15, t));
      return {
        x: lerp(1445, GOLDEN_HOOP.rimX, u),
        y: lerp(PLAT_LOWER.y - BALL_R, GOLDEN_HOOP.rimY - 12, u) - Math.sin(u * Math.PI) * 340,
        rot: 9.8 + u * 10,
      };
    }

    // Scene 5: Swishes cleanly through net & settles on floor below Golden Hoop
    if (t < 24.85) {
      const u = inv(24.15, 24.85, t);
      return {
        x: GOLDEN_HOOP.rimX,
        y: lerp(GOLDEN_HOOP.rimY - 12, FLOOR_Y - BALL_R, u * u),
        rot: 19.8 + u * 3,
      };
    }
    const bounceAfter = Math.max(0, Math.sin(clamp((t - 24.85) / 0.45, 0, 1) * Math.PI) * 58);
    return {
      x: GOLDEN_HOOP.rimX,
      y: FLOOR_Y - BALL_R - bounceAfter,
      rot: 22.8,
    };
  }

  private poseAt(t: number, walkPhase: number): Pose {
    let prev = POSE_KEYS[0];
    let next = POSE_KEYS[POSE_KEYS.length - 1];
    for (let i = 0; i < POSE_KEYS.length; i++) {
      if (POSE_KEYS[i].t <= t) prev = POSE_KEYS[i];
      if (POSE_KEYS[i].t >= t) {
        next = POSE_KEYS[i];
        break;
      }
    }
    const span = Math.max(0.0001, next.t - prev.t);
    const u = next.t === prev.t ? 0 : easeInOut(clamp((t - prev.t) / span, 0, 1));
    const sw = Math.sin(walkPhase * Math.PI * 2);
    return {
      ...prev,
      lean: lerp(prev.lean, next.lean, u),
      hipDrop: lerp(prev.hipDrop, next.hipDrop, u),
      crouch: lerp(prev.crouch, next.crouch, u),
      headTilt: lerp(prev.headTilt, next.headTilt, u),
      headTurn: lerp(prev.headTurn, next.headTurn, u),
      headDrop: lerp(prev.headDrop, next.headDrop, u),
      beanieDangle: lerp(prev.beanieDangle, next.beanieDangle, u),
      look: u < 0.5 ? prev.look : next.look,
      mouth: u < 0.5 ? prev.mouth : next.mouth,
      brow: u < 0.5 ? prev.brow : next.brow,
      eye: u < 0.5 ? prev.eye : next.eye,
      stance: lerp(prev.stance, next.stance, u) + Math.abs(sw) * 28,
      footLift: Math.max(0, sw) * 26,
      handL: { x: lerp(prev.handL.x, next.handL.x, u), y: lerp(prev.handL.y, next.handL.y, u) },
      handR: { x: lerp(prev.handR.x, next.handR.x, u), y: lerp(prev.handR.y, next.handR.y, u) },
      pointL: u < 0.5 ? prev.pointL : next.pointL,
      pointR: u < 0.5 ? prev.pointR : next.pointR,
      fistL: u < 0.5 ? prev.fistL : next.fistL,
      fistR: u < 0.5 ? prev.fistR : next.fistR,
      gripL: u < 0.5 ? prev.gripL : next.gripL,
      gripR: u < 0.5 ? prev.gripR : next.gripR,
    };
  }

  // -------------------------------------------------------------------------
  // Background, Glowing Gravity Zones & Course Architecture
  // -------------------------------------------------------------------------
  private drawBackdrop(ctx: CanvasRenderingContext2D, t: number) {
    ctx.fillStyle = WALL_BG;
    ctx.fillRect(-100, 0, 2100, HEIGHT);

    ctx.fillStyle = WALL_BAND;
    ctx.fillRect(-100, 0, 2100, CEIL_Y);

    // Ceiling Steel Beam Track (used in Scene 4 & Scene 5 ceiling stick!)
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(-100, CEIL_Y - 26, 2100, 26);
    ctx.fill();
    ctx.stroke();

    // Floor Slab
    ctx.fillStyle = FLOOR_TILE;
    ctx.fillRect(-100, FLOOR_Y, 2100, HEIGHT - FLOOR_Y);

    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 4;
    for (let gx = 0; gx <= 1900; gx += 160) {
      ctx.beginPath();
      ctx.moveTo(gx, FLOOR_Y);
      ctx.lineTo(gx - 90, HEIGHT);
      ctx.stroke();
    }

    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-100, FLOOR_Y);
    ctx.lineTo(2000, FLOOR_Y);
    ctx.stroke();

    // Subtle warning stripe when all 3 gravity zones overload in Scene 5
    if (t >= 25.8) {
      const pulse = 0.08 + Math.sin((t - 25.8) * 14) * 0.04;
      ctx.fillStyle = `rgba(168, 85, 247, ${pulse})`;
      ctx.fillRect(620, CEIL_Y, 1020, FLOOR_Y - CEIL_Y);
    }
  }

  private drawGravityZones(ctx: CanvasRenderingContext2D, t: number) {
    const twistOn = t >= 25.8;

    // 1. BLUE GRAVITY ZONE (Sideways >>>) — active from 2.20s onward
    const blueOn = t >= 2.2;
    const blueAlpha = twistOn ? 0.36 : blueOn ? 0.24 : 0.07;
    const blueBox = twistOn
      ? { x: 640, y: 780, w: 380, h: FLOOR_Y - 780 }
      : BLUE_ZONE;
    this.drawZoneField(ctx, blueBox, ZONE_BLUE, blueAlpha, 'right', t, blueOn || twistOn);

    // 2. PURPLE GRAVITY ZONE (Upward ^^^) — activated at 12.35s (+ extends over Stickman in Scene 5!)
    const purpleOn = t >= 12.35;
    if (purpleOn) {
      const pAlpha = twistOn ? 0.36 : 0.23;
      this.drawZoneField(ctx, PURPLE_ZONE, ZONE_PURPLE, pAlpha, 'up', t, true);
      if (twistOn) {
        // Surge column lifting Stickman from floor to ceiling around x=1040..1340
        this.drawZoneField(
          ctx,
          { x: 1045, y: CEIL_Y, w: 300, h: FLOOR_Y - CEIL_Y },
          ZONE_PURPLE,
          0.26,
          'up',
          t,
          true
        );
      }
    } else {
      // Dormant ceiling emitter strip before Scene 3 activation
      this.drawZoneField(ctx, PURPLE_ZONE, ZONE_PURPLE, 0.04, 'up', t, false);
    }

    // 3. GREEN GRAVITY ZONE (Downward vvv) — activated at 12.95s
    const greenOn = t >= 12.95;
    const gAlpha = twistOn ? 0.34 : greenOn ? 0.22 : 0.04;
    this.drawZoneField(ctx, GREEN_ZONE, ZONE_GREEN, gAlpha, 'down', t, greenOn);
  }

  private drawZoneField(
    ctx: CanvasRenderingContext2D,
    rect: { x: number; y: number; w: number; h: number },
    color: string,
    alpha: number,
    dir: 'right' | 'up' | 'down',
    t: number,
    active: boolean
  ) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 18);
    ctx.fill();

    ctx.globalAlpha = active ? 0.85 : 0.25;
    ctx.strokeStyle = color;
    ctx.lineWidth = active ? 5 : 3;
    ctx.setLineDash([16, 10]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Emitter Pad Strip along origin edge
    ctx.globalAlpha = 1;
    ctx.fillStyle = active ? color : METAL_MID;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    if (dir === 'right') {
      ctx.roundRect(rect.x, FLOOR_Y - 16, rect.w, 16, 6);
    } else if (dir === 'up') {
      ctx.roundRect(rect.x + 8, rect.y, rect.w - 16, 14, 6);
    } else {
      ctx.roundRect(rect.x + 8, rect.y, rect.w - 16, 14, 6);
    }
    ctx.fill();
    ctx.stroke();

    // Animated Vector Chevron Arrows inside the zone
    if (active) {
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.88;
      const shift = (t * 90) % 72;
      const cols = Math.max(1, Math.floor((rect.w - 40) / 84));
      const rows = Math.max(1, Math.floor((rect.h - 60) / 96));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let ax = rect.x + 52 + c * 84;
          let ay = rect.y + 62 + r * 96;
          if (dir === 'right') {
            ax = rect.x + 28 + ((c * 84 + shift) % Math.max(40, rect.w - 44));
          } else if (dir === 'up') {
            ay = rect.y + rect.h - 28 - ((r * 96 + shift) % Math.max(40, rect.h - 44));
          } else {
            ay = rect.y + 32 + ((r * 96 + shift) % Math.max(40, rect.h - 44));
          }
          ctx.beginPath();
          if (dir === 'right') {
            ctx.moveTo(ax - 10, ay - 12);
            ctx.lineTo(ax + 8, ay);
            ctx.lineTo(ax - 10, ay + 12);
          } else if (dir === 'up') {
            ctx.moveTo(ax - 12, ay + 8);
            ctx.lineTo(ax, ay - 10);
            ctx.lineTo(ax + 12, ay + 8);
          } else {
            ctx.moveTo(ax - 12, ay - 8);
            ctx.lineTo(ax, ay + 10);
            ctx.lineTo(ax + 12, ay - 8);
          }
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  private drawCourseArchitecture(ctx: CanvasRenderingContext2D, t: number) {
    // 1. Normal Hoop on Left (Scene 1 target at x=550, y=790)
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(NORMAL_HOOP.boardX + 10, NORMAL_HOOP.rimY - 120, 18, FLOOR_Y - (NORMAL_HOOP.rimY - 120));
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.roundRect(NORMAL_HOOP.boardX - 8, NORMAL_HOOP.rimY - 140, 20, 170, 6);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(NORMAL_HOOP.rimX - 42, NORMAL_HOOP.rimY);
    ctx.lineTo(NORMAL_HOOP.boardX - 8, NORMAL_HOOP.rimY);
    ctx.stroke();

    // 2. Vertical Climb Wall at WALL_X (1020) from WALL_TOP_Y (540) to FLOOR_Y (1520)
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(WALL_X, WALL_TOP_Y, 28, FLOOR_Y - WALL_TOP_Y, 8);
    ctx.fill();
    ctx.stroke();

    // Wall climbing rail markings
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    for (let ry = WALL_TOP_Y + 40; ry < FLOOR_Y - 30; ry += 55) {
      ctx.beginPath();
      ctx.moveTo(WALL_X + 7, ry);
      ctx.lineTo(WALL_X + 21, ry);
      ctx.stroke();
    }

    // 3. Purple & Green Zone Control Switch Box at x=730..785 (flipped in Scene 3)
    ctx.fillStyle = METAL_MID;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(650, 1170, 44, 92, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = t >= 12.35 ? ZONE_PURPLE : '#cbd5e1';
    ctx.beginPath();
    ctx.arc(672, 1198, 12, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = t >= 12.95 ? ZONE_GREEN : '#cbd5e1';
    ctx.beginPath();
    ctx.arc(672, 1236, 12, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // 4. Three Floating Platforms (forming the Narrow Gap + Lower Bounce Pad)
    const hover = Math.sin(t * 2.8) * 5;
    this.drawFloatingPlatform(ctx, PLAT_LEFT.x, PLAT_LEFT.y + hover, PLAT_LEFT.w, PLAT_LEFT.h, 0);
    this.drawFloatingPlatform(ctx, PLAT_RIGHT.x, PLAT_RIGHT.y - hover, PLAT_RIGHT.w, PLAT_RIGHT.h, 0);
    this.drawFloatingPlatform(
      ctx,
      PLAT_LOWER.x,
      PLAT_LOWER.y + hover * 0.7,
      PLAT_LOWER.w,
      PLAT_LOWER.h,
      PLAT_LOWER.angle
    );

    // 5. Golden Target Hoop on Right (x=1565, y=730 — always visible in Scenes 2–5!)
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.rect(GOLDEN_HOOP.boardX + 12, GOLDEN_HOOP.rimY - 125, 22, FLOOR_Y - (GOLDEN_HOOP.rimY - 125));
    ctx.fill();
    ctx.stroke();

    // Golden Backboard
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.roundRect(GOLDEN_HOOP.boardX - 8, GOLDEN_HOOP.rimY - 155, 24, 185, 8);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = GOLD_MAIN;
    ctx.lineWidth = 6;
    ctx.strokeRect(GOLDEN_HOOP.boardX - 2, GOLDEN_HOOP.rimY - 140, 12, 155);

    // Back half of Golden Rim
    ctx.strokeStyle = GOLD_DEEP;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(GOLDEN_HOOP.rimX - 50, GOLDEN_HOOP.rimY);
    ctx.lineTo(GOLDEN_HOOP.boardX - 8, GOLDEN_HOOP.rimY);
    ctx.stroke();
  }

  private drawFloatingPlatform(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    angle: number
  ) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(angle);

    // Hover thruster glow underneath
    ctx.fillStyle = 'rgba(14, 165, 233, 0.32)';
    ctx.beginPath();
    ctx.moveTo(-w * 0.36, h / 2);
    ctx.lineTo(w * 0.36, h / 2);
    ctx.lineTo(w * 0.22, h / 2 + 24);
    ctx.lineTo(-w * 0.22, h / 2 + 24);
    ctx.closePath();
    ctx.fill();

    // Main platform deck
    ctx.fillStyle = PLATFORM_CYAN;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PLATFORM_DARK;
    ctx.fillRect(-w / 2 + 6, 0, w - 12, h / 2 - 4);
    ctx.restore();
  }

  private drawGravityTrails(ctx: CanvasRenderingContext2D, t: number) {
    // Crisp dashed trajectory preview during Scene 4 impossible shot (18.8–24.2s)
    if (t >= 18.8 && t <= 24.4) {
      ctx.save();
      ctx.lineWidth = 6;
      ctx.setLineDash([12, 12]);
      ctx.globalAlpha = 0.65;

      // Blue climb segment
      ctx.strokeStyle = ZONE_BLUE;
      ctx.beginPath();
      ctx.moveTo(WALL_X - BALL_R, FLOOR_Y - BALL_R);
      ctx.lineTo(WALL_X - BALL_R, WALL_TOP_Y - 20);
      ctx.stroke();

      // Purple ceiling segment
      if (t >= 20.3) {
        ctx.strokeStyle = ZONE_PURPLE;
        ctx.beginPath();
        ctx.moveTo(WALL_X - BALL_R, CEIL_Y + BALL_R);
        ctx.lineTo(1445, CEIL_Y + BALL_R);
        ctx.stroke();
      }

      // Green narrow-gap drop segment
      if (t >= 21.85) {
        ctx.strokeStyle = ZONE_GREEN;
        ctx.beginPath();
        ctx.moveTo(1445, CEIL_Y + BALL_R);
        ctx.lineTo(1445, PLAT_LOWER.y - BALL_R);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private drawBasketball(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.fillStyle = BALL_ORANGE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Basketball seams
    ctx.strokeStyle = BALL_SEAM;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-BALL_R + 3, 0);
    ctx.lineTo(BALL_R - 3, 0);
    ctx.moveTo(0, -BALL_R + 3);
    ctx.lineTo(0, BALL_R - 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-BALL_R * 0.55, 0, BALL_R * 0.65, -0.95, 0.95);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(BALL_R * 0.55, 0, BALL_R * 0.65, Math.PI - 0.95, Math.PI + 0.95);
    ctx.stroke();

    // Gloss highlight
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.ellipse(-9, -10, 8, 4.5, -0.6, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private drawHoopFrontsAndFX(
    ctx: CanvasRenderingContext2D,
    t: number,
    ball: { x: number; y: number; rot: number }
  ) {
    // Golden Hoop Net & Front Rim
    const netSwish = t >= 24.15 && t < 24.75 ? Math.sin(inv(24.15, 24.75, t) * Math.PI) * 18 : 0;
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 4;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(GOLDEN_HOOP.rimX + i * 14, GOLDEN_HOOP.rimY + 4);
      ctx.lineTo(GOLDEN_HOOP.rimX + i * 9 + netSwish * 0.4, GOLDEN_HOOP.rimY + 68);
      ctx.stroke();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(GOLDEN_HOOP.rimX - 50, GOLDEN_HOOP.rimY);
    ctx.lineTo(GOLDEN_HOOP.rimX + 46, GOLDEN_HOOP.rimY);
    ctx.stroke();
    ctx.strokeStyle = GOLD_MAIN;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(GOLDEN_HOOP.rimX - 50, GOLDEN_HOOP.rimY);
    ctx.lineTo(GOLDEN_HOOP.rimX + 46, GOLDEN_HOOP.rimY);
    ctx.stroke();

    // Victory Confetti Burst at 24.15–25.9s
    if (t >= 24.15 && t <= 26.2) {
      const u = clamp((t - 24.15) / 1.8, 0, 1);
      const colors = [GOLD_MAIN, ZONE_BLUE, ZONE_PURPLE, ZONE_GREEN, '#ef4444'];
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * TAU;
        const dist = 45 + u * (130 + (i % 3) * 40);
        const px = GOLDEN_HOOP.rimX + Math.cos(ang) * dist;
        const py = GOLDEN_HOOP.rimY - 10 + Math.sin(ang) * dist * 0.8 + u * u * 180;
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(u * 5 + i);
        ctx.fillRect(-7, -4, 14, 8);
        ctx.strokeRect(-7, -4, 14, 8);
        ctx.restore();
      }
    }

    // Impact ring when ball hits Vertical Wall in Scene 1 (2.90s)
    if (t >= 2.88 && t <= 3.35) {
      const u = inv(2.88, 3.35, t);
      ctx.save();
      ctx.strokeStyle = ZONE_BLUE;
      ctx.lineWidth = 6 * (1 - u);
      ctx.globalAlpha = 1 - u;
      ctx.beginPath();
      ctx.arc(WALL_X - BALL_R, 960, 22 + u * 55, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // Subtle speed streaks around Stickman when Blue sideways gravity yanks him (25.85–26.6s)
    if (t >= 25.85 && t <= 26.65) {
      ctx.save();
      ctx.strokeStyle = ZONE_BLUE;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const sy = 1120 + i * 85;
        ctx.beginPath();
        ctx.moveTo(ball.x * 0 + 780 + i * 55, sy);
        ctx.lineTo(780 + i * 55 + 95, sy);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // -------------------------------------------------------------------------
  // Locked Angry Stickman Rig (Supports Upside-Down Ceiling Stick + Hanging Beanie)
  // -------------------------------------------------------------------------
  private drawCharacter(ctx: CanvasRenderingContext2D, ch: CharState, pose: Pose, t: number) {
    ctx.save();
    ctx.translate(ch.x, ch.hipY);
    ctx.rotate(ch.rot);
    ctx.translate(-ch.x, -ch.hipY);

    const x = ch.x;
    const hipY = ch.hipY + pose.hipDrop + pose.crouch * 45;
    const shoulderY = hipY - 170;
    const bodyTopX = x + Math.sin(pose.lean) * 170;
    const bodyTilt = pose.lean;

    const footSpread = 22 + pose.stance;
    const footLX = x - footSpread;
    const footLY = ch.hipY + 246 - (pose.footLift > 0 ? pose.footLift : 0);
    const footRX = x + footSpread;
    const footRY = ch.hipY + 246;

    const arms = this.computeArms(pose, x, hipY, t);

    // Back Arm & Leg
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

    // Front Leg
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

    // Yellow T-Shirt Torso
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
    ctx.restore();

    // Head + Red Beanie (with hanging droop when upside down in Scene 5!)
    const headCx = bodyTopX + Math.sin(pose.headTilt) * 12;
    const headCy = shoulderY - 20 - HEAD_R + pose.headDrop;
    this.drawHead(ctx, headCx, headCy, pose, t);

    // Front Arm + Mitten Hands
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

  private drawHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, pose: Pose, t: number) {
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

    // Red Beanie — hangs/droops downward under gravity when upside down in Scene 5!
    ctx.save();
    if (pose.beanieDangle > 0.01) {
      const sway = Math.sin(t * 4.2) * 0.06 * pose.beanieDangle;
      ctx.translate(0, -24 * pose.beanieDangle);
      ctx.rotate(sway);
      ctx.scale(1 - 0.08 * pose.beanieDangle, 1 + 0.35 * pose.beanieDangle);
    }
    this.drawBeanieShape(ctx);
    ctx.restore();

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
