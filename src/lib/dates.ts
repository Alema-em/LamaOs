/** UTC calendar date key — matches `today()` / stored `YYYY-MM-DD` strings. */
export function utcCalendarDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type ContributionCell = { key: string; count: number };

/**
 * GitHub-style grid: `weeks` columns × 7 rows, Sunday-aligned, ending on the
 * Saturday of the current week (future days in the last column stay empty).
 */
export function buildContributionGrid(
  countByDate: Record<string, number>,
  weeks = 12,
): ContributionCell[] {
  const total = weeks * 7;
  const today = new Date();
  const todayKey = utcCalendarDateKey(today);

  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - end.getUTCDay() - (weeks - 1) * 7);

  const cells: ContributionCell[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < total; i++) {
    const key = utcCalendarDateKey(cursor);
    cells.push({
      key,
      count: key <= todayKey ? (countByDate[key] ?? 0) : 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return cells;
}

/** Split an 84-cell grid into week columns (7 rows each). */
export function chunkContributionWeeks(
  cells: ContributionCell[],
  weeks = 12,
): ContributionCell[][] {
  return Array.from({ length: weeks }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}
