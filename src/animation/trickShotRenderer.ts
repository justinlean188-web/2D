import { StudioConfig } from '../types';

/**
 * TrickShotRenderer
 *
 * "ANGRY STICKMAN: TRICK-SHOT CHAMPION" — a 60-second vertical comedy that
 * continues the basketball story. The old hoop has just landed on his head and
 * snapped, so he has no basket at all: he practises trick shots against a
 * wall, a trash can, a bucket and his own targets until a referee arrives with
 * a golden trophy and an intact championship hoop. One impossible backwards
 * shot makes him champion, and the last gag is the trophy swallowing his head.
 *
 * Same flat vector language as the Paper Ball series: white background, black
 * outlines, a round white head, thin black limbs, one orange accent for the
 * ball and the cones, plus gold for the trophy.
 */

type EyeStyle =
  | 'normal'
  | 'wide'
  | 'happy'
  | 'closed'
  | 'angry'
  | 'squint'
  | 'stunned'
  | 'cross';
type BrowStyle = 'neutral' | 'angry' | 'raised' | 'determined' | 'sad' | 'oneRaised';
type MouthStyle =
  | 'flat'
  | 'smile'
  | 'grin'
  | 'open'
  | 'o'
  | 'grit'
  | 'frown'
  | 'wobble'
  | 'smirk'
  | 'pucker';
type HandStyle = 'relaxed' | 'fist' | 'open' | 'point' | 'pointUp' | 'hold';

interface Vec {
  x: number;
  y: number;
}

interface Pose {
  hipX: number;
  hipY: number;
  lean: number;
  jump: number;
  squashX: number;
  squashY: number;
  headTilt: number;
  leftFoot: Vec;
  rightFoot: Vec;
  leftKnee: number;
  rightKnee: number;
  leftHand: Vec;
  rightHand: Vec;
  leftElbow: number;
  rightElbow: number;
  leftHandStyle: HandStyle;
  rightHandStyle: HandStyle;
  eye: EyeStyle;
  brow: BrowStyle;
  mouth: MouthStyle;
  gazeX: number;
  gazeY: number;
  pupilScale: number;
  flush: boolean;
  anger: boolean;
  sweat: boolean;
  /** He is completely inside the trophy. */
  swallowed: boolean;
  /** We are looking at the back of his head. */
  backTurned: boolean;
  /** The legs are replaced by a thumbs-up. */
  thumbsUp: boolean;
}

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

interface Ball {
  x: number;
  y: number;
  r: number;
  spin: number;
}

const TAU = Math.PI * 2;
// Minimalist Monochrome palette: white cartoon basketball with black seams, engraved silver trophy
const ORANGE = '#ffffff';
const GOLD = '#ffffff';
const INK = '#000000';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smooth = (u: number) => {
  const x = clamp(u, 0, 1);
  return x * x * (3 - 2 * x);
};
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u, 0, 1), 2);
/** Gravity-style acceleration for falls and throws. */
const easeIn = (u: number) => clamp(u, 0, 1) * clamp(u, 0, 1);

const CAPTIONS: { text: string; from: number; to: number }[] = [
  // Scene 1 - the final straw
  { text: 'THE HOOP FALLS ON HIS HEAD', from: 0.7, to: 2.5 },
  { text: 'HE CRAWLS OUT FROM THE NET', from: 2.6, to: 4.3 },
  { text: 'HE THROWS AT THE BROKEN HOOP', from: 4.4, to: 5.7 },
  { text: 'IT HITS HIM IN THE FOREHEAD', from: 5.8, to: 7.0 },
  // Scene 2 - the failed trick shots
  { text: 'SHOT ONE: THE WALL', from: 7.1, to: 8.5 },
  { text: 'IT COMES BACK, HITS HIS BOTTOM', from: 8.6, to: 9.9 },
  { text: 'SHOT TWO: THE TRASH CAN', from: 10.0, to: 11.3 },
  { text: 'IT MISSES AND ROLLS AWAY', from: 11.4, to: 12.7 },
  { text: 'SHOT THREE: THE BUCKET', from: 12.8, to: 14.1 },
  { text: 'IT FLIES UP AND LANDS ON HIM', from: 14.2, to: 16.0 },
  // Scene 3 - rage training
  { text: 'RAGE TRAINING BEGINS', from: 16.1, to: 17.6 },
  { text: 'WALLS, BUCKETS AND TARGETS', from: 17.7, to: 19.2 },
  { text: 'HE SLIPS, GETS BACK UP', from: 19.3, to: 20.8 },
  { text: 'DAYS PASS. HE IMPROVES.', from: 20.9, to: 22.4 },
  { text: 'NOW HIS SHOTS START TO LAND', from: 22.5, to: 26.0 },
  // Scene 4 - the championship challenge
  { text: 'A REFEREE AND THE GOLDEN TROPHY', from: 26.1, to: 28.6 },
  { text: 'THE CHAMPIONSHIP CHALLENGE', from: 28.7, to: 30.6 },
  { text: 'HIS FIRST SHOT MISSES', from: 30.7, to: 33.4 },
  { text: 'HE BREATHES IN AND FOCUSES', from: 33.5, to: 36.0 },
  // Scene 5 - the impossible shot
  { text: 'HE THROWS OVER HIS SHOULDER', from: 36.1, to: 38.0 },
  { text: 'WALL. FLOOR. BACKBOARD.', from: 38.1, to: 41.9 },
  { text: 'THE BALL CIRCLES THE RIM', from: 42.0, to: 44.6 },
  { text: 'AND DROPS STRAIGHT THROUGH', from: 44.7, to: 46.4 },
  { text: 'THE CROWD GOES WILD', from: 46.5, to: 49.0 },
  // Scene 6 - the champion
  { text: 'HE WINS THE GOLDEN TROPHY', from: 49.1, to: 52.1 },
  { text: 'THE TRICK-SHOT CHAMPION', from: 52.2, to: 56.0 },
  // Scene 7 - the final gag
  { text: 'HE KISSES THE TROPHY', from: 56.1, to: 57.6 },
  { text: 'A STRAY BALL DROPS INTO IT', from: 57.7, to: 58.7 },
  { text: 'THE TROPHY SWALLOWS HIS HEAD', from: 58.8, to: 60.0 },
];

export class TrickShotRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  private readonly floorY = 1460;

  /** The hero stands here while he is stuck without a hoop. */
  private readonly charX = 330;
  /** He walks over to the championship end for the challenge. */
  private readonly champX = 430;
  private readonly headRadius = 70;
  private readonly ballRadius = 62;

  /** The broken hoop he was using when it fell on his head. */
  private readonly brokenBoardX = 470;
  private readonly brokenBoardY = 470;
  private readonly brokenPoleX = 600;

  /** The intact championship hoop at the far end of the court. */
  private readonly boardX = 810;
  private readonly boardY = 470;
  private readonly rimY = 595;
  private readonly poleX = 940;

  /** The right wall the trick shot rebounds off. */
  private readonly wallX = 1015;

  /** Where the crowd stands in the stands. */
  private readonly crowdY = 700;

  private readonly cameraKeys: CameraKey[] = [
    { t: 0.0, x: 430, y: 880, zoom: 1.12 },
    { t: 1.4, x: 400, y: 900, zoom: 1.18 },
    { t: 2.6, x: 330, y: 980, zoom: 1.12 },
    { t: 3.6, x: 280, y: 1000, zoom: 1.06 },
    { t: 4.6, x: 360, y: 960, zoom: 1.1 },
    { t: 5.6, x: 330, y: 950, zoom: 1.14 },
    { t: 6.6, x: 330, y: 960, zoom: 1.08 },
    { t: 7.4, x: 520, y: 960, zoom: 1.0 },
    { t: 9.4, x: 520, y: 960, zoom: 1.0 },
    { t: 10.4, x: 470, y: 980, zoom: 1.04 },
    { t: 12.2, x: 560, y: 980, zoom: 1.02 },
    { t: 13.4, x: 430, y: 980, zoom: 1.06 },
    { t: 15.2, x: 380, y: 960, zoom: 1.12 },
    { t: 16.2, x: 330, y: 990, zoom: 1.06 },
    { t: 17.0, x: 300, y: 1000, zoom: 1.12 },
    { t: 17.8, x: 700, y: 900, zoom: 1.0 },
    { t: 19.0, x: 380, y: 980, zoom: 1.14 },
    { t: 20.2, x: 330, y: 1060, zoom: 1.18 },
    { t: 21.4, x: 330, y: 960, zoom: 1.12 },
    { t: 22.6, x: 330, y: 1000, zoom: 1.04 },
    { t: 23.8, x: 540, y: 900, zoom: 0.98 },
    { t: 25.0, x: 700, y: 820, zoom: 1.1 },
    { t: 25.9, x: 430, y: 940, zoom: 1.05 },
    { t: 26.6, x: 760, y: 930, zoom: 1.0 },
    { t: 27.8, x: 930, y: 900, zoom: 0.96 },
    { t: 28.8, x: 820, y: 900, zoom: 1.02 },
    { t: 29.6, x: 620, y: 930, zoom: 1.06 },
    { t: 30.6, x: 520, y: 950, zoom: 1.1 },
    { t: 31.6, x: 520, y: 940, zoom: 1.12 },
    { t: 33.0, x: 720, y: 800, zoom: 1.08 },
    { t: 34.8, x: 500, y: 940, zoom: 1.16 },
    { t: 36.2, x: 500, y: 940, zoom: 1.1 },
    { t: 37.8, x: 600, y: 900, zoom: 1.04 },
    { t: 39.4, x: 900, y: 780, zoom: 1.08 },
    { t: 40.6, x: 700, y: 1080, zoom: 1.06 },
    { t: 41.8, x: 810, y: 720, zoom: 1.28 },
    { t: 44.0, x: 810, y: 660, zoom: 1.4 },
    { t: 46.2, x: 810, y: 700, zoom: 1.28 },
    { t: 47.2, x: 480, y: 980, zoom: 1.06 },
    { t: 48.4, x: 480, y: 960, zoom: 1.12 },
    { t: 50.4, x: 560, y: 940, zoom: 1.04 },
    { t: 52.6, x: 500, y: 900, zoom: 1.1 },
    { t: 54.6, x: 500, y: 920, zoom: 1.02 },
    { t: 56.4, x: 540, y: 940, zoom: 1.16 },
    { t: 57.8, x: 500, y: 880, zoom: 1.14 },
    { t: 58.6, x: 490, y: 900, zoom: 1.26 },
    { t: 59.9, x: 490, y: 930, zoom: 1.24 },
  ];

  public render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const t = clamp(time, 0, 60);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.width, this.height);

    const camera = this.getCamera(t);
    ctx.save();
    ctx.translate(this.width / 2 + camera.shakeX, this.height / 2 + camera.shakeY);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    const pose = this.getPose(t);

    this.renderCourt(ctx);
    this.renderCrowd(ctx, t);
    this.renderCones(ctx, t);
    this.renderTrainingProps(ctx, t);
    this.renderReferee(ctx, t);

    // The broken hoop is drawn over him while it is lying on his head.
    const hoopOnHim = t >= 0.15 && t < 3.3;
    if (!hoopOnHim) {
      this.renderBrokenHoop(ctx, t, pose);
    }

    this.renderStickman(ctx, pose, t);
    if (t >= 1.15 && t < 3.8) {
      this.renderNetOnHead(ctx, pose, t);
    }
    // The championship hoop is drawn first so the ball spins in front of it.
    this.renderChampionshipHoop(ctx, t);
    this.renderBalls(ctx, t);
    if (hoopOnHim) {
      this.renderBrokenHoop(ctx, t, pose);
    }
    this.renderTrophy(ctx, t, pose);
    this.renderCalendar(ctx, t);
    this.renderEffects(ctx, t, pose);

    ctx.restore();

    this.renderCaption(ctx, t);

    if (t >= 59.92) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, this.width, this.height);
    }

    if (config.showSafeZones) {
      this.renderSafeZones(ctx);
    }
  }

  /** The narration track: what is happening to the stickman. */
  private renderCaption(ctx: CanvasRenderingContext2D, t: number) {
    for (const caption of CAPTIONS) {
      if (t < caption.from || t > caption.to) continue;
      const fadeIn = Math.min(1, (t - caption.from) / 0.25);
      const fadeOut = Math.min(1, (caption.to - t) / 0.25);
      const alpha = Math.max(0, Math.min(fadeIn, fadeOut));

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let size = 52;
      ctx.font = `900 ${size}px "Arial Black", "Segoe UI", Arial, sans-serif`;
      const maxWidth = this.width - 100;
      const measured = ctx.measureText(caption.text).width;
      if (measured > maxWidth) {
        size = Math.max(26, Math.floor((size * maxWidth) / measured));
        ctx.font = `900 ${size}px "Arial Black", "Segoe UI", Arial, sans-serif`;
      }
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(7, Math.round(size * 0.2));
      ctx.strokeStyle = '#000000';
      ctx.strokeText(caption.text, this.width / 2, 1700);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(caption.text, this.width / 2, 1700);
      ctx.restore();
    }
  }

  // ==========================================================
  // CAMERA
  // ==========================================================

  private getCamera(t: number) {
    const keys = this.cameraKeys;
    let x = keys[0].x;
    let y = keys[0].y;
    let zoom = keys[0].zoom;

    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      if (t >= a.t && t <= b.t) {
        const u = (t - a.t) / Math.max(0.0001, b.t - a.t);
        const e = u * u * (3 - 2 * u);
        x = lerp(a.x, b.x, e);
        y = lerp(a.y, b.y, e);
        zoom = lerp(a.zoom, b.zoom, e);
        break;
      }
      if (t > b.t) {
        x = b.x;
        y = b.y;
        zoom = b.zoom;
      }
    }

    // While the portable hoop is wheeled in, the camera travels with it.
    if (t > 25.85 && t < 28.9) {
      const follow = this.getChampionshipHoopX(t) + 60;
      const blend = Math.min(
        smooth((t - 25.85) / 0.45),
        smooth((28.9 - t) / 0.5)
      );
      x = lerp(x, follow, blend);
      y = lerp(y, 930, blend);
    }

    let shakeX = 0;
    let shakeY = 0;
    const hits = [
      { at: 1.15, amp: 16 },
      { at: 5.0, amp: 8 },
      { at: 5.6, amp: 15 },
      { at: 8.7, amp: 7 },
      { at: 9.4, amp: 12 },
      { at: 11.4, amp: 5 },
      { at: 14.2, amp: 9 },
      { at: 14.9, amp: 13 },
      { at: 17.9, amp: 6 },
      { at: 22.3, amp: 11 },
      { at: 25.2, amp: 6 },
      { at: 32.9, amp: 7 },
      { at: 39.3, amp: 8 },
      { at: 40.45, amp: 11 },
      { at: 41.65, amp: 9 },
      { at: 46.05, amp: 12 },
      { at: 49.9, amp: 5 },
      { at: 58.05, amp: 8 },
      { at: 58.75, amp: 10 },
    ];
    for (const hit of hits) {
      const age = t - hit.at;
      if (age >= 0 && age < 0.32) {
        const decay = Math.exp(-age * 12);
        shakeX += Math.sin(age * 124 + hit.at) * hit.amp * decay;
        shakeY += Math.cos(age * 101 + hit.at) * hit.amp * decay;
      }
    }

    return { x, y, zoom, shakeX, shakeY };
  }

  // ==========================================================
  // COURT + CROWD
  // ==========================================================

  private renderCourt(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';

    // The floor line.
    ctx.beginPath();
    ctx.moveTo(40, this.floorY);
    ctx.lineTo(1040, this.floorY);
    ctx.stroke();

    // The three point arc.
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(this.boardX, this.floorY, 300, Math.PI, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.boardX - 300, this.floorY);
    ctx.lineTo(this.boardX - 300, this.floorY - 34);
    ctx.stroke();

    // The right wall the trick shot rebounds off.
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(this.wallX, 255);
    ctx.lineTo(this.wallX, this.floorY);
    ctx.stroke();

    ctx.restore();
  }

  /** A small crowd of stick figures on the back row of the stands. */
  private renderCrowd(ctx: CanvasRenderingContext2D, t: number) {
    const count = 13;
    const startX = 70;
    const endX = 1010;
    // They hold their breath while the ball circles the rim.
    const holding = t >= 41.8 && t < 46.05;
    const cheering = t >= 46.05 || (t >= 25.0 && t < 26.0);
    const bored = t >= 16.0 && t < 25.0;

    ctx.save();
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // The stand rail.
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(30, this.crowdY + 12);
    ctx.lineTo(1050, this.crowdY + 12);
    ctx.stroke();

    for (let i = 0; i < count; i++) {
      const x = startX + (i * (endX - startX)) / (count - 1);
      const s = 0.26 + ((i * 37) % 5) * 0.012;
      const bob = cheering
        ? Math.abs(Math.sin(t * 6.4 + i * 0.8)) * 26
        : holding
        ? 0
        : bored
        ? Math.sin(t * 1.2 + i) * 3
        : Math.abs(Math.sin(t * 2.2 + i * 0.9)) * 8;

      ctx.save();
      ctx.translate(x, this.crowdY - bob);
      ctx.scale(s, s);

      // Body
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -180);
      ctx.stroke();

      // Head
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -230, 46, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(-15, -236, 7, 0, TAU);
      ctx.arc(15, -236, 7, 0, TAU);
      ctx.fill();

      // Arms
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(0, -170);
      if (cheering) {
        ctx.lineTo(-60, -250);
        ctx.moveTo(0, -170);
        ctx.lineTo(60, -250);
      } else if (holding) {
        ctx.lineTo(-40, -120);
        ctx.moveTo(0, -170);
        ctx.lineTo(40, -120);
      } else {
        ctx.lineTo(-48, -110);
        ctx.moveTo(0, -170);
        ctx.lineTo(48, -110);
      }
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  // ==========================================================
  // THE BROKEN HOOP (the one that fell on his head)
  // ==========================================================

  private renderBrokenHoop(ctx: CanvasRenderingContext2D, t: number, pose: Pose) {
    // Once the camera travels to the incoming championship hoop the wreckage
    // is gone, so the court is clean for the challenge.
    if (t >= 26.25) return;

    const headY = pose.hipY - 334;

    let boardX = this.brokenBoardX;
    let boardY = this.brokenBoardY;
    let boardRot = 0;
    let poleEndX = this.brokenPoleX;
    let poleEndY = 545;
    let baseX = this.brokenPoleX;
    let stub = 1;

    if (t < 1.15) {
      // The fall: it tips over onto his head.
      const fall = easeIn((t - 0.15) / 1.0);
      boardX = lerp(this.brokenBoardX, this.charX, fall);
      boardY = lerp(this.brokenBoardY, headY, fall);
      boardRot = lerp(0, -0.22, fall);
      poleEndX = lerp(this.brokenPoleX, this.charX + 60, fall);
      poleEndY = lerp(545, headY, fall);
    } else if (t < 3.3) {
      // It is lying on his head.
      boardX = this.charX;
      boardY = headY;
      boardRot = -0.22;
      poleEndX = this.charX + 60;
      poleEndY = headY;
    } else if (t < 4.2) {
      // He crawls out and it slides off onto the floor.
      const u = smooth((t - 3.3) / 0.9);
      boardX = lerp(this.charX, 230, u);
      boardY = lerp(headY, 1372, u);
      boardRot = lerp(-0.22, -0.16, u);
      poleEndX = lerp(this.charX + 60, 430, u);
      poleEndY = lerp(headY, 1420, u);
    } else {
      // It lies broken on the floor for the rest of the film.
      boardX = 230;
      boardY = 1372;
      boardRot = -0.16;
      poleEndX = 430;
      poleEndY = 1420;
    }

    // The pole snaps on impact and the foot tumbles away.
    if (t >= 1.15) {
      const u = clamp((t - 1.15) / 1.2, 0, 1);
      baseX = lerp(this.brokenPoleX, 520, easeOut(u));
      stub = 1 - u * 0.92;
    }

    ctx.save();
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineCap = 'round';

    // The snapped foot of the pole, skidding away across the floor.
    if (stub > 0.02) {
      ctx.save();
      ctx.translate(baseX, this.floorY);
      ctx.rotate((1 - stub) * 1.1);
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -140);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, 44, 12, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // The upper pole, still attached to the backboard.
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(baseX, this.floorY);
    ctx.lineTo(poleEndX, poleEndY);
    ctx.stroke();

    // Backboard, rim and net
    ctx.save();
    ctx.translate(boardX, boardY);
    ctx.rotate(boardRot);
    this.drawHoopHead(ctx, t < 1.15);
    ctx.restore();

    ctx.restore();
  }

  // ==========================================================
  // THE INTACT CHAMPIONSHIP HOOP
  // ==========================================================

  private renderChampionshipHoop(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 25.85) return;

    // It is wheeled in from off stage and set up at the far end.
    const roll = clamp((t - 25.85) / 2.9, 0, 1);
    const x = this.getChampionshipHoopX(t);
    const wobble = roll < 1 ? Math.sin(t * 9) * 3 : 0;

    ctx.save();
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // The wheeled frame on the far side of the backboard.
    ctx.save();
    ctx.translate(x + wobble, 0);
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(-118, 520);
    ctx.lineTo(-118, 1330);
    ctx.stroke();
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(-180, 1330);
    ctx.lineTo(-60, 1330);
    ctx.moveTo(-150, 1330);
    ctx.lineTo(-190, this.floorY - 26);
    ctx.moveTo(-90, 1330);
    ctx.lineTo(-50, this.floorY - 26);
    ctx.stroke();

    // The wheels.
    [-1, 1].forEach((side) => {
      const wx = side < 0 ? -190 : -50;
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(wx, this.floorY - 26, 26, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#8f86b5';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(wx - 14, this.floorY - 26);
      ctx.lineTo(wx + 14, this.floorY - 26);
      ctx.stroke();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
    });
    ctx.restore();

    // Backboard, rim and net
    ctx.save();
    ctx.translate(x + wobble, this.boardY);
    this.drawHoopHead(ctx, true);
    ctx.restore();

    ctx.restore();
  }

  private drawHoopHead(ctx: CanvasRenderingContext2D, withNet: boolean) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.rect(-135, -92, 270, 185);
    ctx.fill();
    ctx.stroke();

    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(-50, -50, 100, 90);
    ctx.stroke();

    ctx.fillStyle = ORANGE;
    ctx.beginPath();
    ctx.ellipse(0, 125, 56, 14, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (withNet) {
      this.drawNet(ctx, 0, 0, 0);
    }
  }

  private drawNet(ctx: CanvasRenderingContext2D, x: number, y: number, wobble: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.2;
    const netTop = 133;
    const netBottom = 240;
    for (let i = -2; i <= 2; i++) {
      const u = i / 2;
      ctx.beginPath();
      ctx.moveTo(u * 52, netTop);
      ctx.quadraticCurveTo(
        u * 62 + wobble * 8,
        (netTop + netBottom) / 2,
        u * 28 + wobble * 12,
        netBottom
      );
      ctx.stroke();
    }
    for (let r = 1; r <= 3; r++) {
      const p = r / 4;
      const yy = lerp(netTop, netBottom, p);
      const half = lerp(52, 28, p) + wobble * 6 * Math.sin(p * Math.PI);
      ctx.beginPath();
      ctx.moveTo(-half, yy);
      ctx.quadraticCurveTo(0, yy + 7, half, yy);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** Net strands draped over his head while he crawls free. */
  private renderNetOnHead(ctx: CanvasRenderingContext2D, pose: Pose, t: number) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';

    const headX = pose.hipX + 334 * Math.sin(pose.lean);
    const headY = pose.hipY - 334 * Math.cos(pose.lean);
    ctx.translate(headX, headY);

    const spread = 52 + Math.sin(t * 6) * 4;
    ctx.beginPath();
    ctx.moveTo(-spread, -30);
    ctx.quadraticCurveTo(-spread * 0.5, -80, 0, -64);
    ctx.quadraticCurveTo(spread * 0.5, -80, spread, -30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-spread * 0.85, -10);
    ctx.quadraticCurveTo(0, -46, spread * 0.85, -10);
    ctx.stroke();

    // A long strand trailing on the floor behind him.
    ctx.beginPath();
    ctx.moveTo(46, 24);
    ctx.quadraticCurveTo(120, 210, -70, 470);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(20, 40);
    ctx.quadraticCurveTo(90, 220, -110, 450);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // TRAINING PROPS
  // ==========================================================

  private renderCones(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 15.6 || t > 24.4) return;
    const cones = [
      { x: 180, y: this.floorY },
      { x: 300, y: this.floorY },
      { x: 420, y: this.floorY },
    ];
    ctx.save();
    cones.forEach((c) => {
      ctx.fillStyle = ORANGE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(c.x - 34, c.y);
      ctx.lineTo(c.x - 16, c.y - 78);
      ctx.lineTo(c.x + 16, c.y - 78);
      ctx.lineTo(c.x + 34, c.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(c.x - 25, c.y - 30);
      ctx.lineTo(c.x + 25, c.y - 30);
      ctx.stroke();
    });
    ctx.restore();
  }

  /** The trash can, the bucket and the training target. */
  private renderTrainingProps(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';

    // The small trash can he uses as a target (scene 2).
    if (t >= 9.9 && t < 13.4) {
      const x = 700;
      const y = this.floorY;
      ctx.fillStyle = '#2b2140';
      ctx.beginPath();
      ctx.moveTo(x - 34, y - 84);
      ctx.lineTo(x + 34, y - 84);
      ctx.lineTo(x + 25, y);
      ctx.lineTo(x - 25, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#6b5a8f';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x - 37, y - 90);
      ctx.lineTo(x + 37, y - 90);
      ctx.stroke();
    }

    // The bucket (scene 2 and the training montage).
    if (t >= 12.9 && t < 26.25) {
      this.drawBucket(ctx, 620, this.floorY, 1);
    }

    // The training target board.
    if (t >= 16.0 && t < 26.25) {
      const x = 790;
      const y = this.floorY;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 300);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(x, y - 350, 86, 0, TAU);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y - 350, 54, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y - 350, 24, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = ORANGE;
      ctx.beginPath();
      ctx.arc(x, y - 350, 11, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawBucket(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';

    // The pail.
    ctx.beginPath();
    ctx.moveTo(-52, -110);
    ctx.lineTo(52, -110);
    ctx.lineTo(36, 0);
    ctx.lineTo(-36, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // The rim.
    ctx.beginPath();
    ctx.ellipse(0, -110, 52, 14, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // The handle.
    ctx.beginPath();
    ctx.arc(0, -110, 52, Math.PI, TAU);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // THE REFEREE
  // ==========================================================

  /** Where the portable championship hoop is while it is rolled in. */
  private getChampionshipHoopX(t: number) {
    const roll = clamp((t - 25.85) / 2.9, 0, 1);
    return lerp(1250, this.boardX, smooth(roll));
  }

  /** Where the referee stands at time t. */
  private getRefereeX(t: number) {
    if (t < 25.85) return -260;
    // He pushes the hoop in from behind it.
    if (t < 28.75) return this.getChampionshipHoopX(t) + 160;
    // Then he steps back so the hoop is fully visible.
    if (t < 29.4) return lerp(this.boardX + 160, 640, smooth((t - 28.75) / 0.65));
    // Then he walks back to the sideline to watch the shot.
    if (t < 34.0) return lerp(640, 200, smooth((t - 29.4) / 4.6));
    if (t < 49.6) return 200;
    if (t < 51.2) return lerp(200, 340, smooth((t - 49.6) / 1.6));
    return lerp(340, 260, smooth((t - 51.2) / 2.2));
  }

  private renderReferee(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 25.8) return;

    let walking = true;
    let gesture = 0;
    let carrying = true;
    let face: EyeStyle = 'normal';
    let mouth: MouthStyle = 'flat';

    const x = this.getRefereeX(t);

    if (t >= 25.85 && t < 28.75) {
      // He is pushing the portable hoop into place.
      walking = true;
    } else if (t >= 28.75 && t < 29.4) {
      // He steps back from the hoop.
      walking = true;
    } else if (t >= 29.4 && t < 30.4) {
      // He gestures at the championship hoop.
      walking = false;
      gesture = smooth((t - 29.4) / 0.55);
    } else if (t >= 30.4 && t < 34.0) {
      // He walks back to the sideline to watch.
      walking = true;
    } else if (t >= 34.0 && t < 49.6) {
      walking = false;
    } else if (t >= 49.6 && t < 51.2) {
      walking = true;
    } else {
      walking = false;
      carrying = false;
      face = 'happy';
      mouth = 'smile';
    }

    const bob = walking ? Math.abs(Math.sin(t * 9)) * 10 : 0;
    const hipY = this.floorY - 300 - bob;

    ctx.save();
    ctx.translate(x, hipY);
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Legs
    const stride = walking ? Math.sin(t * 9) * 46 : 0;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-26 + stride * 0.5, 150);
    ctx.lineTo(-30 + stride, 300);
    ctx.moveTo(0, 0);
    ctx.lineTo(26 - stride * 0.5, 150);
    ctx.lineTo(30 - stride, 300);
    ctx.stroke();

    // Shoes
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(-30 + stride, 300);
    ctx.lineTo(-56 + stride, 301);
    ctx.moveTo(30 - stride, 300);
    ctx.lineTo(56 - stride, 301);
    ctx.stroke();

    // Torso
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -220);
    ctx.stroke();

    // The striped referee shirt.
    ctx.save();
    ctx.beginPath();
    ctx.rect(-46, -232, 92, 96);
    ctx.clip();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-46, -232, 92, 96);
    ctx.fillStyle = INK;
    for (let i = -3; i <= 3; i++) {
      ctx.fillRect(i * 26 - 9, -232, 18, 96);
    }
    ctx.restore();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(-46, -232, 92, 96);
    ctx.stroke();

    // Arms
    const shoulderY = -220;
    let leftHand: Vec = { x: -110, y: -40 };
    let rightHand: Vec = { x: 70, y: -110 };
    if (t >= 25.85 && t < 28.75) {
      leftHand = { x: -110, y: -40 };
      rightHand = { x: -50, y: -70 };
    }
    if (gesture > 0) {
      // The free arm points at the championship hoop.
      rightHand = { x: 70 + gesture * 60, y: -110 - gesture * 220 };
    }
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(rightHand.x * 0.55, shoulderY + (rightHand.y - shoulderY) * 0.5);
    ctx.lineTo(rightHand.x, rightHand.y);
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(leftHand.x * 0.55, shoulderY + (leftHand.y - shoulderY) * 0.5);
    ctx.lineTo(leftHand.x, leftHand.y);
    ctx.stroke();

    // Hands
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(rightHand.x, rightHand.y, 7, 0, TAU);
    ctx.arc(leftHand.x, leftHand.y, 7, 0, TAU);
    ctx.fill();

    // Neck + head
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, -220);
    ctx.lineTo(0, -264);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(0, -334, 66, 66, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Face
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(-22, -342, 8, 0, TAU);
    ctx.arc(22, -342, 8, 0, TAU);
    ctx.fill();
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-20, -372);
    ctx.lineTo(-6, -378);
    ctx.moveTo(20, -372);
    ctx.lineTo(6, -378);
    ctx.stroke();
    ctx.beginPath();
    if (mouth === 'smile') {
      ctx.arc(0, -300, 11, 0.15, Math.PI - 0.15);
    } else {
      ctx.moveTo(-11, -300);
      ctx.lineTo(11, -300);
    }
    ctx.stroke();

    // The whistle.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-6, -318);
    ctx.lineTo(10, -322);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(15, -322, 9, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // The trophy he carries (and hands over at 50.4s).
    if (carrying) {
      this.drawTrophy(ctx, x - 110, hipY - 40, 0.78, 0, 1);
    }
  }

  // ==========================================================
  // THE HERO
  // ==========================================================

  private getPose(t: number): Pose {
    const p: Pose = {
      hipX: this.charX,
      hipY: this.floorY - 300,
      lean: 0,
      jump: 0,
      squashX: 1,
      squashY: 1,
      headTilt: 0,
      leftFoot: { x: -50, y: 300 },
      rightFoot: { x: 50, y: 300 },
      leftKnee: -14,
      rightKnee: 14,
      leftHand: { x: -70, y: -110 },
      rightHand: { x: 70, y: -110 },
      leftElbow: -24,
      rightElbow: 24,
      leftHandStyle: 'relaxed',
      rightHandStyle: 'relaxed',
      eye: 'normal',
      brow: 'neutral',
      mouth: 'flat',
      gazeX: 0,
      gazeY: 0,
      pupilScale: 1,
      flush: false,
      anger: false,
      sweat: false,
      swallowed: false,
      backTurned: false,
      thumbsUp: false,
    };

    if (t < 7) {
      this.poseScene1(p, t);
    } else if (t < 16) {
      this.poseScene2(p, t);
    } else if (t < 26) {
      this.poseScene3(p, t);
    } else if (t < 36) {
      this.poseScene4(p, t);
    } else if (t < 49) {
      this.poseScene5(p, t);
    } else if (t < 56) {
      this.poseScene6(p, t);
    } else {
      this.poseScene7(p, t);
    }

    return p;
  }

  /** Scene 1: the hoop lands on his head, he throws at it and it hits him. */
  private poseScene1(p: Pose, t: number) {
    if (t < 1.15) {
      // Braced for the impact.
      p.eye = 'stunned';
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeY = -0.4;
      p.leftHand = { x: -84, y: -160 };
      p.rightHand = { x: 84, y: -160 };
    } else if (t < 2.0) {
      // The hit.
      p.squashY = 0.84;
      p.squashX = 1.12;
      p.eye = 'closed';
      p.mouth = 'open';
      p.sweat = true;
      p.leftHand = { x: -110, y: -150 };
      p.rightHand = { x: 110, y: -150 };
    } else if (t < 3.3) {
      // Crawling out from under the net, furious.
      const u = smooth((t - 2.0) / 1.3);
      p.hipY = lerp(this.floorY - 300, this.floorY - 150, u);
      p.lean = lerp(0.1, 0.55, u);
      p.eye = 'angry';
      p.brow = 'angry';
      p.mouth = 'grit';
      p.leftHand = { x: -110, y: 60 };
      p.rightHand = { x: 110, y: 40 };
      p.leftHandStyle = 'fist';
      p.rightHandStyle = 'fist';
      p.leftFoot = { x: -120, y: 150 };
      p.rightFoot = { x: -40, y: 165 };
      p.leftKnee = -30;
      p.rightKnee = 26;
    } else if (t < 4.0) {
      // He pulls the net off his head and glares at the fallen hoop.
      const u = smooth((t - 3.3) / 0.7);
      p.hipY = lerp(this.floorY - 150, this.floorY - 300, u);
      p.lean = lerp(0.55, 0.05, u);
      p.leftFoot = { x: lerp(-120, -50, u), y: lerp(150, 300, u) };
      p.rightFoot = { x: lerp(-40, 50, u), y: lerp(165, 300, u) };
      p.leftHand = { x: lerp(-110, -96, u), y: lerp(60, -196, u) };
      p.rightHand = { x: lerp(110, 96, u), y: lerp(40, -190, u) };
      p.leftHandStyle = 'open';
      p.rightHandStyle = 'open';
      p.eye = 'angry';
      p.brow = 'angry';
      p.mouth = 'grit';
      p.gazeX = -0.5;
      p.gazeY = 0.2;
    } else if (t < 4.4) {
      // He grabs the basketball.
      p.rightHand = { x: 46, y: -140 };
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -80, y: -90 };
      p.eye = 'angry';
      p.brow = 'angry';
      p.mouth = 'grit';
    } else if (t < 5.0) {
      // He angrily throws it at the fallen hoop.
      const u = (t - 4.4) / 0.6;
      p.lean = -0.22 * Math.sin(u * Math.PI);
      p.rightHand = { x: 120 + u * 70, y: -140 - u * 60 };
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -96, y: -120 };
      p.eye = 'squint';
      p.brow = 'determined';
      p.mouth = 'grit';
      p.gazeX = 0.4;
      p.gazeY = 0.2;
    } else if (t < 5.6) {
      // He watches the ball come back off the metal base.
      p.rightHand = { x: 170, y: -150 };
      p.rightHandStyle = 'open';
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeX = 0.2;
      p.gazeY = 0.5;
    } else if (t < 6.2) {
      // The ball smacks his forehead.
      p.headTilt = -0.32;
      p.eye = 'cross';
      p.mouth = 'open';
      p.sweat = true;
      p.squashY = 0.93;
      p.squashX = 1.07;
      p.leftHand = { x: -120, y: -170 };
      p.rightHand = { x: 120, y: -170 };
      p.rightHandStyle = 'open';
    } else {
      // The eye twitches, then the fists clench with a hard determination.
      p.eye = 'angry';
      p.brow = 'angry';
      p.mouth = 'grit';
      p.anger = true;
      p.flush = true;
      p.leftHand = { x: -80, y: -60 };
      p.leftHandStyle = 'fist';
      p.rightHand = { x: 80, y: -60 };
      p.rightHandStyle = 'fist';
      p.gazeX = 0.5;
      p.gazeY = -0.1;
      if (t < 6.8) {
        p.squashX = 1 + (6.8 - t) * 0.4;
        p.squashY = 1 - (6.8 - t) * 0.3;
      }
    }
  }

  /** Scene 2: the wall shot, the trash can shot and the bucket shot. */
  private poseScene2(p: Pose, t: number) {
    if (t < 9.6) {
      // The wall shot: he throws backwards over his shoulder at the wall.
      const u = clamp((t - 7.0) / 1.4, 0, 1);
      p.backTurned = u > 0.3 && t < 8.4;
      p.lean = u * 0.18;
      p.rightHand = { x: 96 - u * 40, y: -200 + u * 50 };
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -70, y: -140 };
      p.eye = 'squint';
      p.brow = 'determined';
      p.mouth = 'grit';
      if (t > 8.4) {
        // He watches it fly.
        p.backTurned = false;
        p.lean = 0;
        p.rightHand = { x: 80, y: -120 };
        p.rightHandStyle = 'open';
        p.eye = 'wide';
        p.mouth = 'o';
        p.gazeX = 0.9;
        p.gazeY = -0.3;
      }
      if (t > 9.3) {
        // It hits his bottom and he jumps.
        const v = clamp((t - 9.3) / 0.3, 0, 1);
        p.jump = Math.sin(v * Math.PI) * 130;
        p.squashX = 1 + Math.sin(v * Math.PI) * 0.18;
        p.squashY = 1 - Math.sin(v * Math.PI) * 0.16;
        p.eye = 'angry';
        p.brow = 'angry';
        p.mouth = 'open';
        p.anger = true;
        p.flush = true;
        p.leftHand = { x: -110, y: -200 };
        p.rightHand = { x: 110, y: -200 };
        p.leftHandStyle = 'fist';
        p.rightHandStyle = 'fist';
      }
    } else if (t < 12.2) {
      // The trash can shot: a no-look throw that misses and circles the can.
      const u = clamp((t - 9.6) / 2.6, 0, 1);
      if (u < 0.25) {
        // He sets the can down.
        p.hipY = this.floorY - 300 + Math.sin(u * 4 * Math.PI) * 40;
        p.leftHand = { x: -90, y: -60 };
        p.rightHand = { x: 90, y: -60 };
        p.eye = 'normal';
        p.brow = 'neutral';
        p.mouth = 'flat';
      } else if (u < 0.45) {
        // The no-look throw: he turns his head away.
        const v = (u - 0.25) / 0.2;
        p.gazeX = -0.9;
        p.rightHand = { x: 80 + v * 80, y: -150 - v * 60 };
        p.rightHandStyle = 'hold';
        p.eye = 'squint';
        p.brow = 'determined';
        p.mouth = 'grit';
      } else {
        // He spins around to see where it went.
        p.gazeX = 0.9;
        p.eye = 'stunned';
        p.brow = 'raised';
        p.mouth = 'o';
        p.leftHand = { x: -100, y: -130 };
        p.rightHand = { x: 100, y: -130 };
      }
    } else if (t < 13.4) {
      // He chases the runaway ball.
      const u = clamp((t - 12.2) / 1.2, 0, 1);
      p.hipX = this.charX + u * 150;
      p.leftFoot = { x: -60 + Math.sin(t * 16) * 46, y: 300 };
      p.rightFoot = { x: 60 - Math.sin(t * 16) * 46, y: 300 };
      p.lean = 0.16;
      p.leftHand = { x: -110, y: -110 };
      p.rightHand = { x: 110, y: -110 };
      p.leftHandStyle = 'fist';
      p.rightHandStyle = 'fist';
      p.eye = 'angry';
      p.brow = 'angry';
      p.mouth = 'open';
      p.anger = true;
      p.flush = true;
    } else if (t < 14.2) {
      // He sets the bucket down.
      p.hipX = lerp(this.charX + 150, this.charX, smooth((t - 13.0) / 0.6));
      p.hipY = this.floorY - 300 + Math.sin(clamp((t - 13.0) / 0.6, 0, 1) * 4 * Math.PI) * 40;
      p.leftHand = { x: -90, y: -60 };
      p.rightHand = { x: 90, y: -60 };
      p.eye = 'normal';
      p.brow = 'neutral';
      p.mouth = 'flat';
      p.lean = 0;
    } else if (t < 14.6) {
      // The between the legs bounce shot.
      const u = clamp((t - 13.6) / 0.8, 0, 1);
      p.hipY = this.floorY - 300 + u * 60;
      p.squashY = 1 - u * 0.1;
      p.squashX = 1 + u * 0.08;
      p.leftFoot = { x: -70, y: 300 - u * 30 };
      p.rightFoot = { x: 70, y: 300 - u * 30 };
      p.leftHand = { x: -60, y: -60 };
      p.rightHand = { x: 60, y: -60 };
      p.eye = 'squint';
      p.brow = 'determined';
      p.mouth = 'grit';
    } else if (t < 15.0) {
      // It hits the rim of the bucket and flies straight up.
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeX = 0.6;
      p.gazeY = -0.6;
      p.leftHand = { x: -90, y: -120 };
      p.rightHand = { x: 90, y: -120 };
    } else if (t < 15.4) {
      // It lands on his head.
      p.headTilt = -0.28;
      p.eye = 'cross';
      p.mouth = 'open';
      p.sweat = true;
      p.squashY = 0.94;
      p.squashX = 1.06;
    } else {
      // He freezes with a twitching eye.
      p.eye = 'angry';
      p.brow = 'angry';
      p.mouth = 'wobble';
      p.anger = true;
      p.flush = true;
      p.sweat = true;
      p.leftHand = { x: -80, y: -70 };
      p.rightHand = { x: 80, y: -70 };
      p.leftHandStyle = 'fist';
      p.rightHandStyle = 'fist';
    }
  }

  /** Scene 3: the rage training montage, now with walls, buckets and targets. */
  private poseScene3(p: Pose, t: number) {
    p.eye = 'squint';
    p.brow = 'determined';
    p.mouth = 'grit';
    p.flush = true;

    if (t < 17.4) {
      // Dribbling around cones.
      const u = (t - 16.0) / 1.4;
      p.hipX = this.charX + Math.sin(u * Math.PI * 2.4) * 70;
      p.leftFoot = { x: -60 + Math.sin(t * 14) * 40, y: 300 };
      p.rightFoot = { x: 60 - Math.sin(t * 14) * 40, y: 300 };
      p.rightHand = { x: 90, y: -60 + Math.sin(t * 14) * 40 };
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -80, y: -120 };
      p.lean = Math.sin(t * 14) * 0.06;
    } else if (t < 18.6) {
      // Bouncing it off the wall.
      p.rightHand = { x: 110, y: -150 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -80, y: -130 };
      p.gazeX = 0.9;
      p.gazeY = -0.3;
    } else if (t < 19.8) {
      // Spinning throws into a bucket.
      const u = (t - 18.6) / 1.2;
      p.rightHand = { x: 70 + u * 90, y: -180 - Math.sin(u * Math.PI) * 60 };
      p.rightHandStyle = 'hold';
      p.lean = -0.2 * Math.sin(u * Math.PI);
      p.leftHand = { x: -90, y: -140 };
      p.gazeX = 0.7;
    } else if (t < 21.0) {
      // Shooting from an unusual angle: flat on his back.
      const u = smooth((t - 19.8) / 0.5);
      p.hipY = lerp(this.floorY - 300, this.floorY - 80, u);
      p.lean = lerp(0, -1.35, u);
      p.leftFoot = { x: -30, y: 120 };
      p.rightFoot = { x: 40, y: 110 };
      p.leftKnee = -50;
      p.rightKnee = 50;
      p.rightHand = { x: 90, y: -140 - u * 60 };
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -70, y: -80 };
      p.gazeY = -0.6;
    } else if (t < 22.2) {
      // Blindfolded shots.
      const u = (t - 21.0) / 1.2;
      p.rightHand = { x: 80 + u * 90, y: -170 - u * 50 };
      p.rightHandStyle = 'hold';
      p.lean = -0.18 * Math.sin(u * Math.PI);
      p.leftHand = { x: -90, y: -140 };
    } else if (t < 23.4) {
      // He slips and instantly gets back up.
      if (t < 22.9) {
        const u = clamp((t - 22.2) / 0.7, 0, 1);
        p.hipY = lerp(this.floorY - 300, this.floorY - 70, u);
        p.lean = lerp(0, -1.1, u);
        p.leftFoot = { x: -90, y: 300 - u * 60 };
        p.rightFoot = { x: 120, y: 300 - u * 120 };
        p.leftHand = { x: -140, y: 20 };
        p.rightHand = { x: 140, y: 20 };
        p.eye = 'wide';
        p.mouth = 'o';
      } else {
        const u = smooth((t - 22.9) / 0.5);
        p.hipY = lerp(this.floorY - 70, this.floorY - 300, u);
        p.lean = lerp(-1.1, 0, u);
        p.leftFoot = { x: lerp(-90, -50, u), y: lerp(240, 300, u) };
        p.rightFoot = { x: lerp(120, 50, u), y: lerp(180, 300, u) };
        p.leftHand = { x: lerp(-140, -80, u), y: lerp(20, -110, u) };
        p.rightHand = { x: lerp(140, 80, u), y: lerp(20, -110, u) };
        p.eye = 'squint';
        p.mouth = 'grit';
      }
    } else if (t < 24.8) {
      // The calendar: he keeps at it.
      p.rightHand = { x: 100, y: -160 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -80, y: -120 };
      p.gazeY = -0.2;
    } else {
      // The throws finally find the target.
      const u = clamp((t - 24.8) / 0.7, 0, 1);
      p.rightHand = { x: 80 + u * 70, y: -170 - u * 70 };
      p.rightHandStyle = 'hold';
      p.jump = Math.sin(u * Math.PI) * 40;
      p.lean = -0.15 * Math.sin(u * Math.PI);
      p.eye = 'squint';
      p.brow = 'determined';
      p.mouth = 'grit';
      p.gazeX = 0.9;
      p.gazeY = -0.4;
    }
  }

  /** Scene 4: the referee and the championship challenge. */
  private poseScene4(p: Pose, t: number) {
    if (t < 26.6) {
      // He watches the referee walk in.
      p.gazeX = -0.9;
      p.brow = 'oneRaised';
      p.mouth = 'flat';
      p.eye = 'normal';
    } else if (t < 29.4) {
      // He watches the referee wheel the hoop in.
      p.gazeX = 0.9;
      p.gazeY = -0.2;
      p.brow = 'oneRaised';
      p.eye = 'normal';
      p.mouth = 'flat';
    } else if (t < 30.5) {
      // He understands and steps forward.
      const u = smooth((t - 29.4) / 1.1);
      p.hipX = lerp(this.charX, this.champX, u);
      p.brow = 'raised';
      p.eye = 'wide';
      p.mouth = 'smile';
      p.leftHand = { x: -80, y: -130 };
      p.leftHandStyle = 'hold';
      p.rightHand = { x: 80, y: -130 };
      p.gazeY = -0.3;
    } else if (t < 31.4) {
      // The ball spin on one finger.
      const u = (t - 30.4) / 1.0;
      p.rightHand = { x: 74, y: -40 };
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -90, y: -120 };
      p.brow = 'raised';
      p.eye = 'happy';
      p.mouth = 'grin';
      p.lean = Math.sin(u * Math.PI * 2) * 0.04;
      p.gazeY = -0.1;
    } else if (t < 32.2) {
      // Posing for the crowd.
      p.leftHand = { x: -140, y: -150 };
      p.rightHand = { x: 140, y: -150 };
      p.leftHandStyle = 'open';
      p.rightHandStyle = 'open';
      p.leftFoot = { x: -90, y: 300 };
      p.rightFoot = { x: 60, y: 300 };
      p.brow = 'raised';
      p.eye = 'happy';
      p.mouth = 'grin';
      p.gazeY = -0.2;
    } else if (t < 33.8) {
      // His first attempt: a jump shot that misses badly.
      const u = (t - 32.2) / 1.0;
      p.jump = Math.sin(clamp(u * 1.4, 0, 1) * Math.PI) * 90;
      p.rightHand = { x: 70 + u * 90, y: -160 - u * 90 };
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -90, y: -150 };
      p.eye = 'squint';
      p.brow = 'determined';
      p.mouth = 'grit';
      p.gazeX = 0.8;
      p.gazeY = -0.6;
      if (t > 33.0) {
        p.eye = 'wide';
        p.mouth = 'o';
        p.brow = 'raised';
      }
    } else if (t < 34.8) {
      // The confident smile disappears.
      p.brow = 'neutral';
      p.eye = 'normal';
      p.mouth = 'flat';
      p.leftHand = { x: -70, y: -80 };
      p.rightHand = { x: 70, y: -80 };
      p.gazeX = 0.7;
    } else {
      // A deep breath and pure focus.
      const u = clamp((t - 34.8) / 1.2, 0, 1);
      p.brow = 'determined';
      p.eye = 'squint';
      p.mouth = 'grit';
      p.leftHand = { x: -110, y: -80 - u * 30 };
      p.rightHand = { x: 110, y: -80 - u * 30 };
      p.leftHandStyle = 'fist';
      p.rightHandStyle = 'fist';
      p.squashY = 1 + Math.sin(u * Math.PI) * 0.05;
      p.squashX = 1 - Math.sin(u * Math.PI) * 0.04;
      p.gazeX = 0.8;
      p.gazeY = -0.3;
    }
  }

  /** Scene 5: the impossible shot. */
  private poseScene5(p: Pose, t: number) {
    if (t < 37.2) {
      // He turns his back to the hoop and sets up.
      p.backTurned = true;
      p.brow = 'determined';
      p.mouth = 'grit';
      p.rightHand = { x: 70, y: -160 };
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -60, y: -150 };
      p.gazeY = -0.3;
    } else if (t < 37.8) {
      // The throw over the shoulder.
      const u = (t - 37.2) / 0.6;
      p.backTurned = true;
      p.rightHand = { x: 60 + u * 90, y: -170 + u * 110 };
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -70, y: -140 };
      p.lean = 0.12 * Math.sin(u * Math.PI);
    } else if (t < 46.6) {
      // He watches the ball do the impossible.
      p.rightHand = { x: 100, y: -120 };
      p.leftHand = { x: -80, y: -110 };
      p.brow = 'determined';
      p.eye = 'squint';
      p.mouth = 'grit';
      p.gazeX = 0.9;
      p.gazeY = -0.5;
    } else if (t < 47.8) {
      // Disbelief.
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.rightHand = { x: 90, y: -130 };
      p.leftHand = { x: -90, y: -130 };
      p.gazeX = 0.9;
      p.gazeY = -0.4;
      p.squashX = 1.03;
      p.squashY = 0.97;
    } else {
      // Joyful celebration.
      const u = (t - 47.8) / 1.2;
      p.jump = Math.abs(Math.sin(u * Math.PI * 2.4)) * 70;
      p.leftHand = { x: -130, y: -230 };
      p.rightHand = { x: 130, y: -230 };
      p.leftHandStyle = 'open';
      p.rightHandStyle = 'open';
      p.eye = 'happy';
      p.brow = 'raised';
      p.mouth = 'grin';
      p.lean = Math.sin(u * Math.PI * 2.4) * 0.08;
    }
  }

  /** Scene 6: the trophy, the confetti, the champion pose. */
  private poseScene6(p: Pose, t: number) {
    if (t < 50.6) {
      // The referee hands the trophy over.
      p.leftHand = { x: -100, y: -170 };
      p.rightHand = { x: 100, y: -170 };
      p.leftHandStyle = 'open';
      p.rightHandStyle = 'open';
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeX = 0.7;
    } else if (t < 52.2) {
      // He grips the trophy with both hands.
      p.leftHand = { x: -80, y: -210 };
      p.rightHand = { x: 80, y: -210 };
      p.leftHandStyle = 'hold';
      p.rightHandStyle = 'hold';
      p.eye = 'happy';
      p.brow = 'raised';
      p.mouth = 'grin';
      p.gazeY = -0.3;
    } else if (t < 54.2) {
      // He raises it overhead and jumps.
      const u = (t - 52.2) / 2.0;
      p.leftHand = { x: -70, y: -250 - u * 40 };
      p.rightHand = { x: 70, y: -250 - u * 40 };
      p.leftHandStyle = 'hold';
      p.rightHandStyle = 'hold';
      p.jump = Math.abs(Math.sin(u * Math.PI * 2.2)) * 80;
      p.eye = 'happy';
      p.brow = 'raised';
      p.mouth = 'grin';
      p.lean = Math.sin(u * Math.PI * 2.2) * 0.07;
    } else {
      // The greatest athlete in the world.
      p.leftHand = { x: -120, y: -250 };
      p.rightHand = { x: 120, y: -250 };
      p.leftHandStyle = 'open';
      p.rightHandStyle = 'open';
      p.leftFoot = { x: -100, y: 300 };
      p.rightFoot = { x: 70, y: 300 };
      p.eye = 'happy';
      p.brow = 'raised';
      p.mouth = 'grin';
      p.gazeY = -0.2;
    }
  }

  /** Scene 7: the kiss, the stray ball, the trophy over his head. */
  private poseScene7(p: Pose, t: number) {
    if (t < 57.2) {
      // He kisses the trophy.
      const u = clamp((t - 56.0) / 0.5, 0, 1);
      p.leftHand = { x: -70, y: -230 - u * 20 };
      p.rightHand = { x: 70, y: -230 - u * 20 };
      p.leftHandStyle = 'hold';
      p.rightHandStyle = 'hold';
      p.eye = 'happy';
      p.brow = 'raised';
      p.mouth = 'pucker';
      p.headTilt = 0.25 * u;
      p.lean = 0.12 * u;
    } else if (t < 58.3) {
      // He raises it overhead.
      const u = smooth((t - 57.2) / 0.6);
      p.leftHand = { x: -70, y: -260 - u * 40 };
      p.rightHand = { x: 70, y: -260 - u * 40 };
      p.leftHandStyle = 'hold';
      p.rightHandStyle = 'hold';
      p.eye = 'happy';
      p.brow = 'raised';
      p.mouth = 'grin';
      p.headTilt = 0.25 * (1 - u);
      p.lean = 0.12 * (1 - u);
    } else if (t < 59.2) {
      // The trophy tips forward and swallows his head.
      const u = smooth((t - 58.3) / 0.9);
      const swallowed = smooth((t - 58.45) / 0.5);
      p.swallowed = swallowed > 0.5;
      p.hipY = lerp(this.floorY - 300, 940, swallowed);
      const footY = this.floorY - p.hipY;
      p.leftFoot = { x: -60, y: footY };
      p.rightFoot = { x: 60, y: footY };
      p.leftKnee = -16;
      p.rightKnee = 16;
      p.jump = Math.max(0, 40 - u * 60);
    } else {
      // Only the legs are left, and one of them thumbs up.
      p.swallowed = true;
      p.thumbsUp = true;
      p.hipY = 940;
      const u = clamp((t - 59.2) / 0.6, 0, 1);
      const footY = this.floorY - p.hipY;
      p.rightFoot = { x: 60 + u * 30, y: footY - u * 210 };
      p.rightKnee = 16 + u * 26;
      p.leftFoot = { x: -60, y: footY };
    }
  }

  // ==========================================================
  // DRAWING THE HERO
  // ==========================================================

  private renderStickman(ctx: CanvasRenderingContext2D, pose: Pose, t: number) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const trembleX = pose.anger ? Math.sin(t * 40) * 3 : 0;
    const trembleY = pose.anger ? Math.cos(t * 33) * 2 : 0;

    ctx.translate(pose.hipX + trembleX, pose.hipY - pose.jump + trembleY);
    ctx.rotate(pose.lean);
    ctx.scale(pose.squashX, pose.squashY);

    // Legs
    const leftKnee = this.drawLimb(ctx, { x: 0, y: 0 }, pose.leftFoot, pose.leftKnee, 12);
    const rightKnee = this.drawLimb(ctx, { x: 0, y: 0 }, pose.rightFoot, pose.rightKnee, 12);
    if (pose.thumbsUp) {
      this.drawThumbsUpFoot(ctx, pose.rightFoot, rightKnee);
      this.drawFoot(ctx, pose.leftFoot, leftKnee);
    } else {
      this.drawFoot(ctx, pose.leftFoot, leftKnee);
      this.drawFoot(ctx, pose.rightFoot, rightKnee);
    }

    if (pose.swallowed) {
      // Only his legs are left.
      ctx.restore();
      return;
    }

    // Torso
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -220);
    ctx.stroke();

    // Arms
    const shoulder = { x: 0, y: -220 };
    const leftElbow = this.drawLimb(ctx, shoulder, pose.leftHand, pose.leftElbow, 10);
    const rightElbow = this.drawLimb(ctx, shoulder, pose.rightHand, pose.rightElbow, 10);
    this.drawHand(ctx, pose.leftHand, leftElbow, pose.leftHandStyle);
    this.drawHand(ctx, pose.rightHand, rightElbow, pose.rightHandStyle);

    // Neck
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, -220);
    ctx.lineTo(0, -264);
    ctx.stroke();

    // Head
    ctx.save();
    ctx.translate(0, -334);
    ctx.rotate(pose.headTilt);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.headRadius, this.headRadius, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (pose.flush) {
      ctx.fillStyle = ORANGE;
      ctx.beginPath();
      ctx.ellipse(0, 2, this.headRadius - 14, this.headRadius - 14, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    if (!pose.backTurned) {
      this.drawFace(ctx, pose, t);
    }

    if (pose.anger) {
      this.drawAngerMark(ctx, t);
    }

    if (pose.sweat) {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(58, -35);
      ctx.quadraticCurveTo(67, -16, 58, -10);
      ctx.quadraticCurveTo(49, -16, 58, -35);
      ctx.stroke();
    }

    ctx.restore();

    ctx.restore();
  }

  private drawFace(ctx: CanvasRenderingContext2D, pose: Pose, t: number) {
    const eyeY = -10;
    const leftX = -26;
    const rightX = 24;
    const pupilX = clamp(pose.gazeX, -1, 1) * 4.4;
    const pupilY = clamp(pose.gazeY, -1, 1) * 4;
    // The eye twitch after the ball hits his forehead.
    const twitch =
      (t >= 5.9 && t < 6.6) || (t >= 15.4 && t < 16.0)
        ? Math.sin((t - 5.9) * 34) * 5
        : 0;

    this.drawEye(ctx, leftX, eyeY, pose.eye, pupilX, pupilY, pose.pupilScale);
    this.drawEye(ctx, rightX, eyeY, pose.eye, pupilX + twitch, pupilY, pose.pupilScale);

    this.drawBrows(ctx, leftX, rightX, eyeY, pose.brow);

    this.drawMouth(ctx, -1, 31, pose.mouth);
  }

  private drawEye(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    style: EyeStyle,
    pupilX: number,
    pupilY: number,
    pupilScale: number
  ) {
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineCap = 'round';

    if (style === 'closed') {
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x - 9, y);
      ctx.lineTo(x + 9, y);
      ctx.stroke();
      return;
    }

    if (style === 'happy') {
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y + 2, 9, Math.PI, TAU);
      ctx.stroke();
      return;
    }

    if (style === 'cross') {
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 8);
      ctx.lineTo(x + 8, y + 8);
      ctx.moveTo(x + 8, y - 8);
      ctx.lineTo(x - 8, y + 8);
      ctx.stroke();
      return;
    }

    if (style === 'stunned') {
      ctx.lineWidth = 4.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(x + pupilX, y + pupilY, 3.4, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 12);
      ctx.lineTo(x + 11, y - 6);
      ctx.stroke();
      return;
    }

    if (style === 'squint') {
      ctx.lineWidth = 4.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(x + pupilX, y + pupilY, 4.4 * pupilScale, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 1);
      ctx.lineTo(x + 11, y - 3);
      ctx.stroke();
      return;
    }

    if (style === 'wide') {
      ctx.lineWidth = 4.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(x + pupilX, y + pupilY, 5 * pupilScale, 0, TAU);
      ctx.fill();
      return;
    }

    if (style === 'angry') {
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(x, y + 1, 7.4, 5, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 8);
      ctx.lineTo(x + 11, y - 2);
      ctx.stroke();
      return;
    }

    // normal
    ctx.beginPath();
    ctx.arc(x, y, 7.4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + pupilX * 0.3 - 1.6, y + pupilY * 0.3 - 1.6, 1.8, 0, TAU);
    ctx.fill();
  }

  private drawBrows(
    ctx: CanvasRenderingContext2D,
    leftX: number,
    rightX: number,
    eyeY: number,
    style: BrowStyle
  ) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    const y = eyeY - 22;

    const draw = (x: number, innerLift: number, outerLift: number) => {
      const isLeft = x < 0;
      const innerX = isLeft ? x + 11 : x - 11;
      const outerX = isLeft ? x - 11 : x + 11;
      ctx.beginPath();
      ctx.moveTo(outerX, y + outerLift);
      ctx.lineTo(innerX, y + innerLift);
      ctx.stroke();
    };

    if (style === 'angry') {
      draw(leftX, 7, -6);
      draw(rightX, 7, -6);
    } else if (style === 'determined') {
      draw(leftX, 5, -5);
      draw(rightX, 5, -5);
    } else if (style === 'raised') {
      draw(leftX, -5, -10);
      draw(rightX, -5, -10);
    } else if (style === 'oneRaised') {
      draw(leftX, -5, -10);
      draw(rightX, 0, 0);
    } else if (style === 'sad') {
      draw(leftX, -6, 5);
      draw(rightX, -6, 5);
    } else {
      draw(leftX, 0, 0);
      draw(rightX, 0, 0);
    }
  }

  private drawMouth(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    style: MouthStyle
  ) {
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';

    if (style === 'smile') {
      ctx.beginPath();
      ctx.arc(x, y - 2, 10, 0, Math.PI);
      ctx.stroke();
    } else if (style === 'grin') {
      ctx.beginPath();
      ctx.arc(x, y - 2, 12, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.rect(x - 7, y + 5, 14, 3);
      ctx.fill();
    } else if (style === 'open') {
      ctx.beginPath();
      ctx.ellipse(x, y + 2, 8, 11, 0, 0, TAU);
      ctx.fill();
    } else if (style === 'o') {
      ctx.beginPath();
      ctx.arc(x, y + 1, 7, 0, TAU);
      ctx.stroke();
    } else if (style === 'pucker') {
      ctx.beginPath();
      ctx.ellipse(x, y + 1, 6, 7, 0, 0, TAU);
      ctx.fill();
    } else if (style === 'grit') {
      ctx.beginPath();
      ctx.rect(x - 11, y - 4, 22, 9);
      ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x - 5, y - 4);
      ctx.lineTo(x - 5, y + 5);
      ctx.moveTo(x + 5, y - 4);
      ctx.lineTo(x + 5, y + 5);
      ctx.stroke();
    } else if (style === 'frown') {
      ctx.beginPath();
      ctx.arc(x, y + 9, 10, Math.PI, TAU);
      ctx.stroke();
    } else if (style === 'wobble') {
      ctx.beginPath();
      ctx.moveTo(x - 12, y);
      ctx.quadraticCurveTo(x - 6, y - 6, x, y);
      ctx.quadraticCurveTo(x + 6, y + 6, x + 12, y);
      ctx.stroke();
    } else if (style === 'smirk') {
      ctx.beginPath();
      ctx.moveTo(x - 10, y + 2);
      ctx.quadraticCurveTo(x + 2, y - 6, x + 12, y - 4);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x + 10, y);
      ctx.stroke();
    }
  }

  private drawAngerMark(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.translate(54, -60);
    ctx.rotate(Math.sin(t * 10) * 0.08);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const a = -0.7 + i * 0.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
      ctx.lineTo(Math.cos(a) * 19, Math.sin(a) * 19);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawLimb(
    ctx: CanvasRenderingContext2D,
    start: Vec,
    end: Vec,
    bend: number,
    width: number
  ): Vec {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy) || 1;
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const joint = {
      x: midX + (-dy / len) * bend,
      y: midY + (dx / len) * bend,
    };

    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(joint.x, joint.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    return joint;
  }

  private drawHand(
    ctx: CanvasRenderingContext2D,
    hand: Vec,
    elbow: Vec,
    style: HandStyle
  ) {
    const angle = Math.atan2(hand.y - elbow.y, hand.x - elbow.x);
    ctx.save();
    ctx.translate(hand.x, hand.y);
    ctx.fillStyle = INK;

    if (style === 'point') {
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 26, Math.sin(angle) * 26);
      ctx.stroke();
    } else if (style === 'open') {
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        const a = angle + i * 0.32;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16);
        ctx.stroke();
      }
    } else if (style === 'fist') {
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, TAU);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, style === 'hold' ? 6.5 : 5.5, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawFoot(ctx: CanvasRenderingContext2D, foot: Vec, knee: Vec) {
    const dir = foot.x < knee.x ? -1 : 1;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(foot.x, foot.y);
    ctx.lineTo(foot.x + dir * 24, foot.y + 1);
    ctx.stroke();
  }

  /** A leg that ends in a thumbs-up. */
  private drawThumbsUpFoot(ctx: CanvasRenderingContext2D, foot: Vec, knee: Vec) {
    const dir = foot.x < knee.x ? -1 : 1;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;

    // The fist.
    ctx.beginPath();
    ctx.arc(foot.x, foot.y, 17, 0, TAU);
    ctx.fill();

    // The thumb.
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(foot.x, foot.y - 12);
    ctx.lineTo(foot.x + dir * 6, foot.y - 34);
    ctx.stroke();

    void knee;
  }

  // ==========================================================
  // BALLS
  // ==========================================================

  private renderBalls(ctx: CanvasRenderingContext2D, t: number) {
    const balls: Ball[] = [];

    // --- Scene 1: the throw at the fallen hoop ---
    if (t >= 3.6 && t < 6.2) {
      let x = 420;
      let y = this.floorY - this.ballRadius;
      if (t < 4.4) {
        // He picks it up.
        const u = smooth((t - 3.6) / 0.8);
        x = lerp(420, 400, u);
        y = lerp(this.floorY - this.ballRadius, 1000, u);
      } else if (t < 5.0) {
        // The angry throw at the metal base.
        const u = clamp((t - 4.4) / 0.6, 0, 1);
        x = lerp(400, 470, u);
        y = lerp(1000, 1380, easeIn(u));
      } else if (t < 5.6) {
        // It bounces off the base and flies back up at him.
        const u = clamp((t - 5.0) / 0.6, 0, 1);
        x = lerp(470, this.charX + 6, u);
        y = lerp(1380, 745, easeOut(u));
      } else {
        // It sits on his forehead for a beat.
        x = this.charX + 6;
        y = 745;
      }
      balls.push({ x, y, r: this.ballRadius, spin: t * 6 });
    }

    // --- Scene 2: the wall shot ---
    if (t >= 7.4 && t < 9.5) {
      const u = clamp((t - 7.4) / 2.0, 0, 1);
      let x: number;
      let y: number;
      if (u < 0.5) {
        // Out to the wall.
        const v = u / 0.5;
        x = lerp(430, this.wallX, v);
        y = lerp(1000, 780, v) - Math.sin(v * Math.PI) * 160;
      } else {
        // Back at him.
        const v = (u - 0.5) / 0.5;
        x = lerp(this.wallX, this.charX, v);
        y = lerp(780, 1300, v) + Math.sin(v * Math.PI) * 60;
      }
      balls.push({ x, y, r: this.ballRadius, spin: t * 8 });
    }

    // --- Scene 2: the trash can shot ---
    if (t >= 10.4 && t < 12.6) {
      const u = clamp((t - 10.4) / 2.0, 0, 1);
      let x: number;
      let y: number;
      if (u < 0.45) {
        // The no-look throw towards the can.
        const v = u / 0.45;
        x = lerp(430, 660, v);
        y = lerp(1000, 1250, v) - Math.sin(v * Math.PI) * 200;
      } else {
        // It sails past the can, curls around it and rolls away on the floor.
        const v = (u - 0.45) / 0.55;
        x = 660 + Math.sin(v * Math.PI) * 120 + v * 230;
        y = lerp(1250, this.floorY - this.ballRadius, easeIn(v));
      }
      balls.push({ x, y, r: this.ballRadius, spin: t * 9 });
    }

    // --- Scene 2: the bucket shot ---
    if (t >= 13.6 && t < 15.4) {
      const u = clamp((t - 13.6) / 1.7, 0, 1);
      let x: number;
      let y: number;
      if (u < 0.35) {
        // The between the legs bounce shot.
        const v = u / 0.35;
        x = lerp(this.charX + 20, 620, v);
        y = lerp(this.floorY - this.ballRadius, 1340, v);
      } else if (u < 0.55) {
        // It hits the rim of the bucket and fires straight up.
        const v = (u - 0.35) / 0.2;
        x = 620;
        y = lerp(1340, 1350, v);
      } else {
        // It comes straight back down onto his head.
        const v = (u - 0.55) / 0.45;
        x = lerp(620, this.charX + 6, easeOut(v));
        y = lerp(1350, 745, easeIn(v));
      }
      balls.push({ x, y, r: this.ballRadius, spin: t * 9 });
    }

    // --- Scene 3: the training montage ---
    if (t >= 16.0 && t < 26.2) {
      if (t < 17.4) {
        // Dribbling around the cones.
        const u = (t - 16.0) / 1.4;
        const hx = this.charX + Math.sin(u * Math.PI * 2.4) * 70;
        const phase = (t * 2.6) % 1;
        balls.push({
          x: hx + 100,
          y: this.floorY - this.ballRadius - Math.abs(Math.sin(phase * Math.PI)) * 340,
          r: this.ballRadius,
          spin: t * 8,
        });
      } else if (t < 18.6) {
        // Bouncing off the wall.
        const u = clamp((t - 17.4) / 1.2, 0, 1);
        const back = u < 0.5;
        const v = back ? u / 0.5 : (u - 0.5) / 0.5;
        balls.push({
          x: back ? lerp(430, this.wallX, v) : lerp(this.wallX, 430, v),
          y: lerp(1000, 700, v) - Math.sin(v * Math.PI) * 200,
          r: this.ballRadius,
          spin: t * 8,
        });
      } else if (t < 19.8) {
        // Spinning throws into the bucket.
        const u = (t - 18.6) / 1.2;
        balls.push({
          x: lerp(430, 620, u),
          y: lerp(1000, 1330, u) - Math.sin(u * Math.PI) * 220,
          r: this.ballRadius,
          spin: t * 18,
        });
      } else if (t < 21.0) {
        // Lying down shots.
        const u = clamp((t - 19.8) / 1.2, 0, 1);
        balls.push({
          x: lerp(this.charX, 600, u),
          y: lerp(1120, 700, u) - Math.sin(u * Math.PI) * 180,
          r: this.ballRadius,
          spin: t * 9,
        });
      } else if (t < 22.2) {
        // Blindfolded shots: they go nowhere.
        const u = clamp((t - 21.0) / 1.2, 0, 1);
        balls.push({
          x: lerp(400, 120, u),
          y: lerp(1020, 620, u) - Math.sin(u * Math.PI) * 120,
          r: this.ballRadius,
          spin: t * 9,
        });
      } else if (t < 23.4) {
        // The slip.
        const u = clamp((t - 22.2) / 1.2, 0, 1);
        balls.push({
          x: lerp(330, 150, u),
          y: this.floorY - this.ballRadius - Math.abs(Math.sin(u * 8)) * 180,
          r: this.ballRadius,
          spin: t * 9,
        });
      } else {
        // The practice shots that start to find the target.
        const u = clamp((t - 24.8) / 1.0, 0, 1);
        balls.push({
          x: lerp(420, 790, u),
          y: lerp(1000, 1090, u) - Math.sin(u * Math.PI) * 300,
          r: this.ballRadius,
          spin: t * 8,
        });
      }
    }

    // --- Scene 4: the championship ball ---
    if (t >= 29.2 && t < 30.4) {
      // He steps forward with the ball in his far hand.
      balls.push({ x: this.champX - 80, y: 1030, r: this.ballRadius, spin: t * 4 });
    } else if (t >= 30.4 && t < 31.4) {
      // The finger spin.
      const a = (t - 30.4) * 15;
      balls.push({
        x: this.champX + 74 + Math.cos(a) * 26,
        y: 1120 + Math.sin(a) * 11,
        r: this.ballRadius,
        spin: t * 16,
      });
    } else if (t >= 31.4 && t < 32.2) {
      // He holds it out while he poses for the crowd.
      balls.push({ x: this.champX + 140, y: 1010, r: this.ballRadius, spin: t * 3 });
    } else if (t >= 32.2 && t < 34.6) {
      // The attempt that misses badly.
      const u = clamp((t - 32.2) / 1.2, 0, 1);
      let x: number;
      let y: number;
      if (u < 0.5) {
        const v = u / 0.5;
        x = lerp(this.champX + 90, 810, v);
        y = lerp(940, this.rimY, v) - Math.sin(v * Math.PI) * 260;
      } else {
        const v = (u - 0.5) / 0.5;
        x = lerp(810, 330, easeIn(v));
        y = lerp(this.rimY, this.floorY - this.ballRadius, v) - Math.sin(v * Math.PI) * 120;
      }
      balls.push({ x, y, r: this.ballRadius, spin: t * 8 });
    }

    // --- Scene 5: the impossible shot ---
    if (t >= 37.2 && t < 46.8) {
      balls.push(this.getImpossibleShotBall(t));
    }

    // --- Scene 7: the stray ball that lands in the trophy ---
    if (t >= 57.7 && t < 58.6) {
      const u = clamp((t - 57.7) / 0.65, 0, 1);
      const trophy = this.getTrophyTransform(t);
      balls.push({
        x: trophy.x,
        y: lerp(-120, trophy.y, easeIn(u)),
        r: this.ballRadius,
        spin: t * 12,
      });
    }

    balls.forEach((b) => this.drawBall(ctx, b.x, b.y, b.r, b.spin));
  }

  /** The ball of the impossible shot: wall, floor, backboard, rim, through. */
  private getImpossibleShotBall(t: number): Ball {
    const r = this.ballRadius;

    if (t < 37.8) {
      // In his hand.
      return { x: this.champX + 75, y: 980, r, spin: t * 6 };
    }
    if (t < 39.3) {
      // Flying at the wall.
      const u = clamp((t - 37.8) / 1.5, 0, 1);
      return {
        x: lerp(this.champX + 75, this.wallX, u),
        y: lerp(980, 760, u) - Math.sin(u * Math.PI) * 120,
        r,
        spin: t * 9,
      };
    }
    if (t < 40.5) {
      // Rebounding off the wall down to the floor.
      const u = clamp((t - 39.3) / 1.2, 0, 1);
      return {
        x: lerp(this.wallX, 640, u),
        y: lerp(760, this.floorY - r, easeIn(u)),
        r,
        spin: t * 9,
      };
    }
    if (t < 41.7) {
      // Off the floor and up to the backboard.
      const u = clamp((t - 40.5) / 1.2, 0, 1);
      return {
        x: lerp(640, this.boardX, u),
        y: lerp(this.floorY - r, 700, u) - Math.sin(u * Math.PI) * 260,
        r,
        spin: t * 9,
      };
    }
    if (t < 42.4) {
      // Off the backboard and down onto the rim.
      const u = clamp((t - 41.7) / 0.7, 0, 1);
      return {
        x: lerp(this.boardX, this.boardX + 20, u),
        y: lerp(700, this.rimY + 10, u),
        r,
        spin: t * 12,
      };
    }
    if (t < 46.05) {
      // Spinning around the rim in glorious slow motion.
      const u = clamp((t - 42.4) / 3.65, 0, 1);
      const a = -1.2 + u * Math.PI * 3.4;
      return {
        x: this.boardX + Math.cos(a) * 52,
        y: this.rimY + Math.sin(a) * 13 - 6,
        r,
        spin: t * 26,
      };
    }
    if (t < 46.9) {
      // Dropping cleanly through the net.
      const u = clamp((t - 46.05) / 0.85, 0, 1);
      return {
        x: this.boardX,
        y: lerp(this.rimY + 10, this.rimY + 210, easeIn(u)),
        r,
        spin: t * 26,
      };
    }
    return { x: this.boardX, y: this.rimY + 210, r, spin: t * 26 };
  }

  private drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, spin: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);

    ctx.fillStyle = ORANGE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.44, r, 0, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.44, r, 0, Math.PI / 2, (Math.PI * 3) / 2);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // THE TROPHY
  // ==========================================================

  /** Where the trophy is, and how far it has tipped forward. */
  private getTrophyTransform(t: number) {
    if (t < 50.4) {
      // Still in the referee's hands.
      return {
        x: this.getRefereeX(t) - 110,
        y: this.floorY - 300 - 40,
        angle: 0,
        scale: 0.78,
      };
    }
    if (t < 52.2) {
      // The handover.
      const u = smooth((t - 50.4) / 1.8);
      return {
        x: lerp(this.getRefereeX(50.4) - 110, this.champX, u),
        y: lerp(this.floorY - 340, 1030, u),
        angle: 0,
        scale: lerp(0.78, 1, u),
      };
    }
    if (t < 56.0) {
      // Overhead.
      return { x: this.champX, y: 640, angle: 0, scale: 1 };
    }
    if (t < 57.2) {
      // Brought down for the kiss.
      const u = smooth((t - 56.0) / 0.6);
      return { x: lerp(this.champX, this.champX + 60, u), y: lerp(640, 960, u), angle: 0, scale: 1 };
    }
    if (t < 58.3) {
      // Back up overhead.
      const u = smooth((t - 57.2) / 0.8);
      return { x: lerp(this.champX + 60, this.champX, u), y: lerp(960, 640, u), angle: 0, scale: 1 };
    }
    // It tips forward and swallows him.
    const u = smooth((t - 58.3) / 0.9);
    return {
      x: this.champX,
      y: lerp(640, 800, u),
      angle: lerp(0, 1.15, u),
      scale: lerp(1, 1.12, u),
    };
  }

  private renderTrophy(ctx: CanvasRenderingContext2D, t: number, pose: Pose) {
    void pose;
    if (t < 49.6) return;
    const tr = this.getTrophyTransform(t);
    this.drawTrophy(ctx, tr.x, tr.y, tr.scale, tr.angle, 1);
  }

  /** A giant golden trophy. The origin is the middle of the cup. */
  private drawTrophy(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    angle: number,
    alpha: number
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    ctx.strokeStyle = INK;
    ctx.fillStyle = GOLD;
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';

    // The cup.
    ctx.beginPath();
    ctx.moveTo(-104, -58);
    ctx.quadraticCurveTo(-96, 70, 0, 104);
    ctx.quadraticCurveTo(96, 70, 104, -58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // The rim.
    ctx.beginPath();
    ctx.ellipse(0, -58, 104, 26, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // The inner shadow of the cup.
    ctx.fillStyle = '#c98a06';
    ctx.beginPath();
    ctx.ellipse(0, -58, 86, 19, 0, 0, TAU);
    ctx.fill();

    // The handles.
    ctx.fillStyle = GOLD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(-104, -4, 40, -1.35, 1.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(104, -4, 40, Math.PI - 1.35, Math.PI + 1.35);
    ctx.stroke();

    // The stem and the base.
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.rect(-16, 96, 32, 54);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-58, 150);
    ctx.lineTo(58, 150);
    ctx.lineTo(44, 196);
    ctx.lineTo(-44, 196);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // A little shine.
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.moveTo(-72, -40);
    ctx.lineTo(-50, -44);
    ctx.lineTo(-34, 40);
    ctx.lineTo(-56, 46);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // ==========================================================
  // THE CALENDAR (time passing, no text)
  // ==========================================================

  private renderCalendar(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 23.2 || t > 25.2) return;

    const fade = t < 23.6 ? smooth((t - 23.2) / 0.4) : t > 24.8 ? 1 - smooth((t - 24.8) / 0.4) : 1;
    const cx = 540;
    const cy = 560;

    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(cx, cy);
    ctx.scale(0.95, 0.95);

    // The board.
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(-320, -240, 640, 480, 18);
    ctx.fill();
    ctx.stroke();

    // The header bar.
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.roundRect(-320, -240, 640, 78, 18);
    ctx.fill();
    ctx.fillRect(-320, -200, 640, 40);

    // Two rings.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(-170, -258, 22, 0, TAU);
    ctx.arc(170, -258, 22, 0, TAU);
    ctx.stroke();

    // The grid of days.
    const cols = 7;
    const rows = 4;
    const cellW = 80;
    const cellH = 82;
    const startX = -280;
    const startY = -140;
    ctx.lineWidth = 4;
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(startX + c * cellW, startY);
      ctx.lineTo(startX + c * cellW, startY + rows * cellH);
      ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(startX, startY + r * cellH);
      ctx.lineTo(startX + cols * cellW, startY + r * cellH);
      ctx.stroke();
    }

    // The days that have been lived through.
    const total = 2.6;
    const u = clamp((t - 23.6) / total, 0, 1);
    const marked = Math.floor(u * 27);
    for (let i = 0; i < marked; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const px = startX + c * cellW + cellW / 2;
      const py = startY + r * cellH + cellH / 2;
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(px, py, 15, 0, TAU);
      ctx.fill();
    }

    // The page that is turning.
    const pageU = (u * 27) % 1;
    if (pageU < 0.45) {
      const flip = pageU / 0.45;
      ctx.save();
      ctx.translate(320 - flip * 640, 0);
      ctx.scale(Math.max(0.02, Math.cos(flip * Math.PI)), 1);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.rect(0, -240, 320, 480);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // ==========================================================
  // EFFECTS
  // ==========================================================

  private renderEffects(ctx: CanvasRenderingContext2D, t: number, pose: Pose) {
    // The hoop landing on his head.
    this.impactBurst(ctx, t, 1.15, 0.4, this.charX, 840, 110);
    this.stars(ctx, t, 1.2, 0.6, this.charX, 800, 5);
    // The ball off the metal base and into his forehead.
    this.impactBurst(ctx, t, 5.0, 0.24, 470, 1380, 60);
    this.impactBurst(ctx, t, 5.6, 0.3, this.charX + 6, 760, 66);
    this.stars(ctx, t, 5.65, 0.5, this.charX, 770, 4);
    // The wall shot.
    this.impactBurst(ctx, t, 8.7, 0.24, this.wallX, 780, 58);
    this.impactBurst(ctx, t, 9.4, 0.24, this.charX, 1300, 56);
    // The trash can shot.
    this.impactBurst(ctx, t, 11.6, 0.2, 700, 1150, 50);
    // The bucket shot.
    this.impactBurst(ctx, t, 14.2, 0.26, 620, 1340, 58);
    this.impactBurst(ctx, t, 14.9, 0.3, this.charX + 6, 760, 66);
    this.stars(ctx, t, 14.95, 0.5, this.charX, 770, 4);
    // The training montage.
    this.impactBurst(ctx, t, 17.9, 0.2, this.wallX, 700, 54);
    this.impactBurst(ctx, t, 22.3, 0.26, 150, this.floorY, 60);
    this.impactBurst(ctx, t, 25.2, 0.26, 790, 1090, 58);
    // The missed championship attempt.
    this.impactBurst(ctx, t, 32.9, 0.26, 810, this.rimY, 62);
    // The impossible shot.
    this.impactBurst(ctx, t, 39.3, 0.22, this.wallX, 760, 58);
    this.impactBurst(ctx, t, 40.45, 0.26, 640, this.floorY, 62);
    this.impactBurst(ctx, t, 41.65, 0.24, this.boardX, 640, 62);
    this.impactBurst(ctx, t, 46.05, 0.3, this.boardX, this.rimY, 72);
    // The trophy.
    this.impactBurst(ctx, t, 58.05, 0.22, this.champX, 660, 56);
    this.impactBurst(ctx, t, 58.75, 0.26, this.champX, 800, 66);

    // Confetti for the championship.
    if (t >= 49.6) {
      this.renderConfetti(ctx, t);
    }

    // A heart for the trophy kiss.
    if (t >= 56.4 && t < 57.4) {
      const u = (t - 56.4) / 1.0;
      const hx = this.champX + 60;
      const hy = 900 - u * 90;
      const s = 1 + Math.sin(u * Math.PI) * 0.3;
      ctx.save();
      ctx.translate(hx, hy);
      ctx.scale(s, s);
      ctx.fillStyle = ORANGE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 22);
      ctx.bezierCurveTo(-34, -8, -20, -40, 0, -20);
      ctx.bezierCurveTo(20, -40, 34, -8, 0, 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Celebration sparkles around the champion.
    if (t >= 46.6) {
      const spots = [
        { x: 300, y: 700 },
        { x: 580, y: 620 },
        { x: 760, y: 820 },
        { x: 260, y: 980 },
        { x: 680, y: 1060 },
      ];
      spots.forEach((p, i) => {
        const pulse = Math.sin((t - 46.6) * 7 + i * 1.7);
        if (pulse > 0.2) {
          this.sparkle(ctx, p.x, p.y, 12 + pulse * 9, 0.3 + pulse * 0.35);
        }
      });
    }

    void pose;
  }

  private renderConfetti(ctx: CanvasRenderingContext2D, t: number) {
    const palette = ['#000000', '#ffffff', '#222222', '#666666', '#cccccc'];
    const count = 54;
    for (let i = 0; i < count; i++) {
      const seed = (i * 9301 + 49297) % 233280;
      const rnd = seed / 233280;
      const speed = 0.28 + rnd * 0.42;
      const phase = ((t - 49.6) * speed + rnd) % 1;
      const x = 140 + rnd * 800 + Math.sin(phase * 7 + i) * 26;
      const y = 90 + phase * 1330;
      const rot = phase * 9 + i;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = palette[i % palette.length];
      ctx.globalAlpha = 1 - phase * 0.5;
      ctx.fillRect(-8, -5, 16, 10);
      ctx.restore();
    }
  }

  private impactBurst(
    ctx: CanvasRenderingContext2D,
    t: number,
    at: number,
    duration: number,
    x: number,
    y: number,
    radius: number
  ) {
    const age = t - at;
    if (age < 0 || age > duration) return;
    const u = age / duration;
    ctx.save();
    ctx.globalAlpha = 1 - u;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU + at;
      const r0 = radius * (0.35 + u * 0.9);
      const r1 = r0 + radius * 0.45 * (1 - u);
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
      ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      ctx.stroke();
    }
    ctx.restore();
  }

  private stars(
    ctx: CanvasRenderingContext2D,
    t: number,
    at: number,
    duration: number,
    x: number,
    y: number,
    count: number
  ) {
    const age = t - at;
    if (age < 0 || age > duration) return;
    const u = age / duration;
    ctx.save();
    ctx.globalAlpha = 1 - u;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + at * 2;
      const d = 60 + u * 90;
      const px = x + Math.cos(a) * d;
      const py = y + Math.sin(a) * d * 0.6;
      const s = 14 * (1 - u * 0.5);
      ctx.beginPath();
      ctx.moveTo(px - s, py);
      ctx.lineTo(px + s, py);
      ctx.moveTo(px, py - s);
      ctx.lineTo(px, py + s);
      ctx.stroke();
    }
    ctx.restore();
  }

  private sparkle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    alpha: number
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================
  // SAFE ZONES
  // ==========================================================

  private renderSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(60, 220, this.width - 120, this.height - 560);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(this.width - 160, 400, 120, 900);
    ctx.fillRect(60, this.height - 340, this.width - 120, 260);
    ctx.fillStyle = '#111111';
    ctx.font = '600 24px "JetBrains Mono", monospace';
    ctx.fillText('9:16 MOBILE SAFE BOUNDS (1080 × 1920)', 80, 200);
    ctx.restore();
  }
}
