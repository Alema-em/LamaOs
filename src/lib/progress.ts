/** Clamp a percentage to 0–100; non-finite values become 0. */
export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

/** Safe ratio → percentage; returns 0 when denominator is invalid or ≤ 0. */
export function safePercentage(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return 0;
  }
  return clampPercent((numerator / denominator) * 100);
}

/** Weight journey: (start − current) / (start − goal), clamped 0–100%. */
export function weightJourneyPercent(start: number, current: number, goal: number): number {
  return safePercentage(start - current, start - goal);
}

export function kgLost(start: number, current: number): number {
  if (!Number.isFinite(start) || !Number.isFinite(current)) return 0;
  return +Math.max(0, start - current).toFixed(1);
}

export function kgRemaining(current: number, goal: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(goal)) return 0;
  return +Math.max(0, current - goal).toFixed(1);
}

export function hasWeightSetup(start: number, current: number, goal: number): boolean {
  return start > 0 && current > 0 && goal > 0;
}

export function weightJourneyMetrics(start: number, current: number, goal: number) {
  const lost = kgLost(start, current);
  const remaining = kgRemaining(current, goal);
  const journeyPct = weightJourneyPercent(start, current, goal);
  return {
    lost,
    remaining,
    journeyPct,
    remainingPct: clampPercent(100 - journeyPct),
  };
}

/** Average of percentage values, clamped 0–100. */
export function averagePercent(values: number[]): number {
  if (!values.length) return 0;
  return clampPercent(values.reduce((a, b) => a + b, 0) / values.length);
}

/** Solved problems vs DSA goal; 0 when no goal set. */
export function dsaGoalPercent(solved: number, goal: number): number {
  if (goal <= 0) return 0;
  return clampPercent((solved / goal) * 100);
}
