import type { DsaProblem } from "@/hooks/use-game";
import { buildContributionGrid } from "@/lib/dates";

export const DSA_TOPICS = [
  "Arrays",
  "Strings",
  "Linked Lists",
  "Stacks & Queues",
  "Trees",
  "BST",
  "Heap",
  "Graphs",
  "Tries",
  "Binary Search",
  "Two Pointers",
  "Sliding Window",
  "Recursion",
  "Backtracking",
  "Bit Manipulation",
  "Sorting",
  "Intervals",
  "Greedy",
  "Dynamic Programming",
  "Union Find",
  "Segment Trees",
  "Math",
  "Design",
  "SQL",
] as const;

export type DsaTopic = (typeof DSA_TOPICS)[number];

const TOPIC_SET = new Set<string>(DSA_TOPICS);

export function bucketDsaTopic(topic: string | undefined): DsaTopic | "Other" {
  if (topic && TOPIC_SET.has(topic)) return topic as DsaTopic;
  return "Other";
}

/** Count problems per selectable topic; unknown legacy topics roll into Other. */
export function dsaTopicCounts(problems: DsaProblem[]): Record<string, number> {
  const counts: Record<string, number> = { Other: 0 };
  for (const t of DSA_TOPICS) counts[t] = 0;
  for (const p of problems) {
    const bucket = bucketDsaTopic(p.topic);
    counts[bucket] = (counts[bucket] ?? 0) + 1;
  }
  return counts;
}

/** Consecutive days with at least one logged problem (today may still be empty). */
export function dsaStreak(problems: DsaProblem[]): number {
  const dates = new Set<string>();
  for (const p of problems) {
    const d = typeof p.date === "string" && p.date.length >= 10 ? p.date.slice(0, 10) : "";
    if (d) dates.add(d);
  }
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const key = cursor.toISOString().slice(0, 10);
    if (dates.has(key)) streak++;
    else if (i === 0) {
      /* today not logged yet — keep counting from yesterday */
    } else break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Topics to show in coverage bars (standard topics + Other when non-zero). */
export function dsaTopicCoverageRows(problems: DsaProblem[]): { topic: string; count: number }[] {
  const counts = dsaTopicCounts(problems);
  const rows: { topic: string; count: number }[] = DSA_TOPICS.map((topic) => ({
    topic,
    count: counts[topic] ?? 0,
  }));
  if ((counts.Other ?? 0) > 0) rows.push({ topic: "Other", count: counts.Other });
  return rows;
}

/** Last N weeks of DSA activity for the contribution grid (84 cells, week-aligned). */
export function buildDsaActivityGrid(problems: DsaProblem[], weeks = 12) {
  const countByDate: Record<string, number> = {};
  for (const p of problems) {
    const k = typeof p.date === "string" && p.date.length >= 10 ? p.date.slice(0, 10) : "";
    if (k) countByDate[k] = (countByDate[k] ?? 0) + 1;
  }
  return buildContributionGrid(countByDate, weeks);
}
