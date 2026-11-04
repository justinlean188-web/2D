// Shared cartoon mitten hand for the stickman shorts.
//
// The hand is drawn in a local space where +x points from the wrist toward
// the fingertips. `drawHand` rotates that space to match the forearm, so the
// mitten always continues the arm instead of sitting on it sideways.
//
// Objects (balls, cups, paddles) are drawn by the renderer. A held object can
// be sandwiched between two passes: the "full" pass draws the palm and thumb
// behind the object, then the "overlay" pass redraws just the thumb and
// fingertips on top so the hand visibly wraps the prop.

const TAU = Math.PI * 2;
const INK = '#17121f';
const WHITE = '#ffffff';

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

const STROKE = 4.5;

function capsule(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number
) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath();
  ctx.arc(x0, y0, r, a + Math.PI / 2, a - Math.PI / 2);
  ctx.arc(x1, y1, r, a - Math.PI / 2, a + Math.PI / 2);
  ctx.closePath();
}

function part(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number
) {
  capsule(ctx, x0, y0, x1, y1, r);
  ctx.fillStyle = WHITE;
  ctx.strokeStyle = INK;
  ctx.lineWidth = STROKE;
  ctx.fill();
  ctx.stroke();
}

function crease(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number
) {
  ctx.strokeStyle = 'rgba(23,18,31,0.45)';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(x0 + 4, (y0 + y1) / 2, x1, y1);
  ctx.stroke();
}

function drawThumb(ctx: CanvasRenderingContext2D, curled = false) {
  if (curled) {
    part(ctx, 1, -8, 11, -5, 5.5);
  } else {
    part(ctx, 3, -7, 11, -18, 5);
  }
}

function drawFingerTips(ctx: CanvasRenderingContext2D) {
  part(ctx, -1, 10, 9, 10.5, 4.5);
  part(ctx, 1, 4.5, 11, 5, 4.5);
}

function drawGripThumb(ctx: CanvasRenderingContext2D) {
  part(ctx, -1, -10, 9, -12, 5.5);
}

function drawGripFingers(ctx: CanvasRenderingContext2D) {
  part(ctx, -2, 10, 8, 11, 4.5);
  part(ctx, 1, 5, 10, 6, 4.5);
}

function drawMitten(
  ctx: CanvasRenderingContext2D,
  pose: HandPose['type'],
  layer: 'full' | 'overlay'
) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (pose) {
    case 'relaxed': {
      if (layer === 'overlay') return;
      drawThumb(ctx, false);
      part(ctx, -2, 0, 13, 0, 12);
      crease(ctx, 17, -8, 21, -4);
      crease(ctx, 17, 8, 21, 4);
      break;
    }

    case 'fist': {
      if (layer === 'overlay') return;
      drawThumb(ctx, true);
      part(ctx, -2, 0, 8, 0, 13);
      crease(ctx, 15, -7, 18, -3);
      crease(ctx, 15, 0, 18, 0);
      crease(ctx, 15, 7, 18, 3);
      break;
    }

    case 'point': {
      if (layer === 'overlay') return;
      drawThumb(ctx, false);
      part(ctx, -2, 0, 10, 0, 12);
      part(ctx, 8, -1, 32, -1, 5.5);
      break;
    }

    case 'throw': {
      if (layer === 'overlay') return;
      drawThumb(ctx, false);
      part(ctx, -3, 0, 10, 0, 12);
      part(ctx, 8, -6, 27, -14, 4.5);
      part(ctx, 10, 0, 31, 0, 4.5);
      part(ctx, 8, 6, 27, 14, 4.5);
      break;
    }

    case 'grip':
    case 'paddle':
    case 'cup': {
      if (layer === 'overlay') {
        drawGripThumb(ctx);
        drawGripFingers(ctx);
        return;
      }
      part(ctx, -12, 0, 2, 0, 12);
      drawGripThumb(ctx);
      drawGripFingers(ctx);
      break;
    }

    case 'ball': {
      if (layer === 'overlay') {
        drawGripThumb(ctx);
        drawGripFingers(ctx);
        return;
      }
      part(ctx, -13, 0, 0, 0, 15);
      // Extra finger mass on the far side of the ball.
      part(ctx, -10, 10, 0, 12, 4.5);
      drawGripThumb(ctx);
      drawGripFingers(ctx);
      break;
    }

    default: {
      if (layer === 'overlay') return;
      part(ctx, -2, 0, 12, 0, 12);
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
  drawMitten(ctx, style.pose, layer);
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
  drawMitten(ctx, style.pose, style.layer ?? 'full');
  ctx.restore();
}

export { TAU };
