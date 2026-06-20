// Lightweight forecasting helpers used across modules.

export function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length;
  if (n < 2) return null;
  const sx = points.reduce((a, p) => a + p.x, 0);
  const sy = points.reduce((a, p) => a + p.y, 0);
  const sxy = points.reduce((a, p) => a + p.x * p.y, 0);
  const sxx = points.reduce((a, p) => a + p.x * p.x, 0);
  const denom = n * sxx - sx * sx || 1;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  return { slope, intercept };
}

export function daysBetween(a: string | Date, b: string | Date) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Forecast weight at a future date based on the last N entries. */
export function forecastWeight(history: { date: string; weight: number }[], targetDate: string) {
  if (history.length < 2) return null;
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-Math.min(21, sorted.length));
  const x0 = new Date(recent[0].date).getTime();
  const pts = recent.map((h) => ({
    x: (new Date(h.date).getTime() - x0) / 86400000,
    y: h.weight,
  }));
  const reg = linearRegression(pts);
  if (!reg) return null;
  const t = (new Date(targetDate).getTime() - x0) / 86400000;
  return +(reg.intercept + reg.slope * t).toFixed(2);
}

/** When (date) will this trajectory reach target weight? */
export function projectGoalDate(history: { date: string; weight: number }[], goal: number) {
  if (history.length < 2) return null;
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-Math.min(21, sorted.length));
  const x0 = new Date(recent[0].date).getTime();
  const pts = recent.map((h) => ({
    x: (new Date(h.date).getTime() - x0) / 86400000,
    y: h.weight,
  }));
  const reg = linearRegression(pts);
  if (!reg || reg.slope >= 0) return null;
  const t = (goal - reg.intercept) / reg.slope;
  const today = (Date.now() - x0) / 86400000;
  const daysLeft = Math.max(0, Math.round(t - today));
  const d = new Date();
  d.setDate(d.getDate() + daysLeft);
  return {
    date: isoDate(d),
    daysLeft,
    perWeek: +(-reg.slope * 7).toFixed(2),
  };
}
