// Shared cartoon mitten hand for the stickman shorts.
//
// The hand is drawn in a local space where +x points from the wrist toward
// the fingertips. `drawHand` rotates that space to match the forearm, so the
// mitten always continues the arm instead of sitting on it sideways.
//
// A hand is a union of rounded parts (palm, thumb, fingers). The union is
// painted with one silhouette: fill, stroke, then fill again so the stroke
// that fell inside the shape is erased. That keeps overlapping parts seamless
// instead of showing every capsule outline.
//
// Objects (balls, cups, paddles) are drawn by the renderer. A held object can
// be sandwiched between two passes: the "full" pass draws the palm and thumb
// behind the object, then the "overlay" pass redraws just the thumb and
// fingers on top so the hand visibly wraps the prop.

export const TAU = Math.PI * 2;
const INK = '#17121f';
const WHITE = '#ffffff';
const STROKE = 4.5;

export interface HandPose {
  type: 'relaxed' | 'fist' | 'point' | 'grip' | 'paddle' | 'ball' | 'cup' | 'throw';
  rotation?: number;
  gripWidth?: number;
}

export interface ArmSegment {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
}

export interface HandStyle {
  pose: HandPose['type'];
  rotation?: number;
  gripWidth?: number;
  side: 'left' | 'right';
  layer?: 'full' | 'overlay';
}

type Shape = (ctx: CanvasRenderingContext2D) => void;

function capsule(x0: number, y0: number, x1: number, y1: number, r: number): Shape {
  return (ctx) => {
    const a = Math.atan2(y1 - y0, x1 - x0);
    // Back cap bulges behind (x0), front cap bulges ahead (x1). Every capsule
    // is wound the same way, so overlapping parts union cleanly.
    ctx.moveTo(
      x0 + Math.cos(a + Math.PI / 2) * r,
      y0 + Math.sin(a + Math.PI / 2) * r
    );
    ctx.arc(x0, y0, r, a + Math.PI / 2, a - Math.PI / 2, false);
    ctx.arc(x1, y1, r, a - Math.PI / 2, a + Math.PI / 2, false);
    ctx.closePath();
  };
}

// Paints a seamless silhouette from overlapping rounded parts.
function paintUnion(ctx: CanvasRenderingContext2D, parts: Shape[], width = STROKE) {
  ctx.beginPath();
  for (const part of parts) part(ctx);
  ctx.fillStyle = WHITE;
  ctx.fill();

  // Outline: stroke wide, then fill the shape again so only the outside half
  // of the stroke survives and the internal seams disappear.
  ctx.strokeStyle = INK;
  ctx.lineWidth = width * 2;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.fillStyle = WHITE;
  ctx.fill();
}

function crease(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  bend = 4
) {
  ctx.strokeStyle = 'rgba(23,18,31,0.45)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(x0 + bend, (y0 + y1) / 2, x1, y1);
  ctx.stroke();
}

// --- pose building blocks -------------------------------------------------
// Palm: ~24 wide. The back cap sits on the wrist so it reads as a collar
// around the arm, and the front cap is where the fingers attach.

const palm = (len = 12, r = 12): Shape[] => [capsule(0, 0, len, 0, r)];

const openThumb = (): Shape => capsule(4, -10, 16, -16, 6);

const foldedThumb = (): Shape => capsule(4, -9, 14, -4, 6);

const wrappedFingers = (): Shape[] => [
  capsule(8, 8, 20, 6, 5),
  capsule(9, 1, 21, 0, 5),
  capsule(8, -7, 20, -9, 5),
];

const ballFingers = (): Shape[] => [
  capsule(7, 10, 19, 9, 5.5),
  capsule(8, 2, 20, 1, 5.5),
  capsule(7, -9, 19, -11, 5.5),
];

function fingerCreases(ctx: CanvasRenderingContext2D, front: number) {
  crease(ctx, front - 4, -8, front - 2, -4);
  crease(ctx, front - 4, 0, front - 2, 0);
  crease(ctx, front - 4, 8, front - 2, 4);
}

function drawHandPose(
  ctx: CanvasRenderingContext2D,
  pose: HandPose['type'],
  layer: 'full' | 'overlay'
) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (pose) {
    case 'relaxed': {
      if (layer === 'overlay') return;
      paintUnion(ctx, [...palm(14, 11.5), openThumb()]);
      crease(ctx, 8, -10, 13, -5);
      fingerCreases(ctx, 25);
      break;
    }

    case 'fist': {
      if (layer === 'overlay') return;
      paintUnion(ctx, [...palm(10, 13), foldedThumb()]);
      crease(ctx, 12, -10, 16, -3);
      fingerCreases(ctx, 23);
      break;
    }

    case 'point': {
      if (layer === 'overlay') return;
      paintUnion(ctx, [
        ...palm(10, 12),
        capsule(10, 3, 19, 4, 6.5),
        openThumb(),
        capsule(12, -6, 32, -8, 5.5),
      ]);
      crease(ctx, 9, -10, 13, -5);
      break;
    }

    case 'throw': {
      if (layer === 'overlay') return;
      paintUnion(ctx, [
        ...palm(11, 12),
        openThumb(),
        capsule(10, -6, 27, -15, 5),
        capsule(11, 0, 29, 0, 5),
        capsule(10, 6, 27, 15, 5),
      ]);
      crease(ctx, 10, -11, 14, -5);
      break;
    }

    case 'grip':
    case 'paddle':
    case 'cup': {
      if (layer === 'overlay') {
        paintUnion(ctx, [foldedThumb(), ...wrappedFingers()]);
        return;
      }
      paintUnion(ctx, [...palm(9, 12.5), foldedThumb(), ...wrappedFingers()]);
      crease(ctx, 11, -10, 15, -3);
      break;
    }

    case 'ball': {
      if (layer === 'overlay') {
        paintUnion(ctx, [foldedThumb(), ...ballFingers()]);
        return;
      }
      paintUnion(ctx, [...palm(8, 13.5), foldedThumb(), ...ballFingers()]);
      crease(ctx, 12, -10, 16, -3);
      break;
    }

    default: {
      if (layer === 'overlay') return;
      paintUnion(ctx, [...palm(12, 12), openThumb()]);
      break;
    }
  }
}

export function drawHand(
  ctx: CanvasRenderingContext2D,
  arm: ArmSegment,
  style: HandStyle
) {
  const forearmAngle = Math.atan2(arm.hy - arm.ey, arm.hx - arm.ex);
  const handAngle = style.rotation ?? forearmAngle;
  const layer = style.layer ?? 'full';

  ctx.save();
  ctx.translate(arm.hx, arm.hy);
  ctx.rotate(handAngle);
  if (style.side === 'left') ctx.scale(1, -1);
  drawHandPose(ctx, style.pose, layer);
  ctx.restore();
}

export function drawHandSimple(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  style: HandStyle
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  if (style.side === 'left') ctx.scale(1, -1);
  drawHandPose(ctx, style.pose, style.layer ?? 'full');
  ctx.restore();
}
