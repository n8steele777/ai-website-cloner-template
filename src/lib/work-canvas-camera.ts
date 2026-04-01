/**
 * 2D camera smoothing tuned to match {@link SmoothScrollProvider} Lenis options
 * (lerp 0.06, wheelMultiplier 0.88) for omnidirectional trackpad / wheel pan.
 */
export const WORK_CANVAS_LERP = 0.06 as const;
export const WORK_CANVAS_WHEEL_MULT = 0.88 as const;

/** Frame-rate–independent exponential smoothing toward target */
export function dampToward(current: number, target: number, lerp: number, dtSeconds: number): number {
  const k = 1 - Math.pow(1 - lerp, Math.min(dtSeconds * 60, 8));
  return current + (target - current) * k;
}

/**
 * Integrate wheel/drag delta while keeping wrapped target in `[tile, 2*tile)`.
 * Shifts `current` by the same amount as `target` when wrapping so motion stays seamless.
 */
export function shiftWrappedAxis(
  target: number,
  current: number,
  delta: number,
  tile: number,
): { target: number; current: number } {
  if (tile <= 0) {
    return { target: target + delta, current };
  }
  let t = target + delta;
  let c = current;
  let adjusted = false;
  while (t >= 2 * tile) {
    t -= tile;
    c -= tile;
    adjusted = true;
  }
  while (t < tile) {
    t += tile;
    c += tile;
    adjusted = true;
  }
  if (!adjusted) {
    c = current;
  }
  return { target: t, current: c };
}

/** After damping, re-sync if numerical drift pushed target outside wrapped interval */
export function normalizeWrappedPair(
  target: number,
  current: number,
  tile: number,
): { target: number; current: number } {
  if (tile <= 0) {
    return { target, current };
  }
  let t = target;
  let c = current;
  while (t >= 2 * tile) {
    t -= tile;
    c -= tile;
  }
  while (t < tile) {
    t += tile;
    c += tile;
  }
  return { target: t, current: c };
}
