import type { GameState } from "@/hooks/use-game";

export type EventCategory =
  | "fitness"
  | "workout"
  | "goal"
  | "milestone"
  | "project"
  | "task"
  | "dsa"
  | "application"
  | "journal"
  | "achievement";

export interface TimelineEvent {
  id: string;
  date: string; // YYYY-MM-DD
  category: EventCategory;
  title: string;
  detail?: string;
  link?: string;
}

export function buildEvents(state: GameState): TimelineEvent[] {
  const out: TimelineEvent[] = [];

  // Fitness — weight logs
  state.fitness.history.forEach((h, i) => {
    out.push({
      id: `w-${i}-${h.date}`,
      date: h.date,
      category: "fitness",
      title: `Logged weight ${h.weight}kg`,
      link: "/fitness",
    });
  });

  // Workouts
  state.fitness.workouts.forEach((w) => {
    out.push({
      id: `wo-${w.id}`,
      date: w.date,
      category: "workout",
      title: `${w.type} workout`,
      detail: `${w.minutes} min`,
      link: "/fitness",
    });
  });

  // Goals — creation & milestone completions
  state.goals.forEach((g) => {
    out.push({
      id: `g-${g.id}`,
      date: g.createdAt,
      category: "goal",
      title: `Created goal: ${g.title}`,
      detail: g.category,
      link: "/goals",
    });
    g.milestones.forEach((m) => {
      if (m.done && m.date) {
        out.push({
          id: `gm-${g.id}-${m.id}`,
          date: m.date,
          category: "milestone",
          title: `Completed milestone: ${m.title}`,
          detail: g.title,
          link: "/goals",
        });
      }
    });
  });

  // Projects — creation, milestones, task completion
  state.projects.forEach((p) => {
    out.push({
      id: `p-${p.id}`,
      date: p.createdAt,
      category: "project",
      title: `Created project: ${p.name}`,
      link: "/projects",
    });
    p.milestones.forEach((m) => {
      if (m.done && m.date) {
        out.push({
          id: `pm-${p.id}-${m.id}`,
          date: m.date,
          category: "milestone",
          title: `Project milestone: ${m.title}`,
          detail: p.name,
          link: "/projects",
        });
      }
    });
    p.tasks.forEach((t) => {
      if (t.done && t.doneAt) {
        out.push({
          id: `pt-${p.id}-${t.id}`,
          date: t.doneAt,
          category: "task",
          title: `Completed: ${t.title}`,
          detail: p.name,
          link: "/projects",
        });
      }
    });
  });

  // DSA problems
  state.dsa.problems.forEach((p) => {
    out.push({
      id: `dsa-${p.id}`,
      date: p.date,
      category: "dsa",
      title: `Solved DSA: ${p.title}`,
      detail: `${p.difficulty} · ${p.topic}`,
      link: "/dsa",
    });
  });

  // Applications
  state.internships.applications.forEach((a) => {
    out.push({
      id: `app-${a.id}`,
      date: a.date,
      category: "application",
      title: `Applied: ${a.company}`,
      detail: a.role,
      link: "/internships",
    });
  });

  // Journal
  state.journal.forEach((j) => {
    out.push({
      id: `j-${j.id}`,
      date: j.date,
      category: "journal",
      title: j.title || `${j.kind} journal`,
      detail: j.body.slice(0, 80),
      link: "/journal",
    });
  });

  // Achievements (no timestamp available)
  state.achievements.forEach((code, i) => {
    out.push({
      id: `ach-${code}-${i}`,
      date: "",
      category: "achievement",
      title: `Unlocked: ${code}`,
      link: "/achievements",
    });
  });

  return out.sort((a, b) => b.date.localeCompare(a.date));
}

// ===== Snapshots =====

function isoWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  return x.toISOString().slice(0, 10);
}
function isoMonth(d: Date) {
  return d.toISOString().slice(0, 7);
}

export interface Snapshot {
  key: string; // week start (YYYY-MM-DD) or month (YYYY-MM)
  label: string;
  weightAvg: number | null;
  weightDelta: number | null; // vs previous
  dsaCount: number;
  applications: number;
  interviews: number;
  tasksCompleted: number;
  journalEntries: number;
  workouts: number;
}

function inRange(dateStr: string, start: Date, end: Date) {
  if (!dateStr) return false;
  const t = new Date(dateStr).getTime();
  return t >= start.getTime() && t < end.getTime();
}

function snapshotFor(
  state: GameState,
  start: Date,
  end: Date,
  key: string,
  label: string,
): Snapshot {
  const weights = state.fitness.history
    .filter((h) => inRange(h.date, start, end))
    .map((h) => h.weight);
  const weightAvg = weights.length
    ? +(weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(2)
    : null;

  const dsaCount = state.dsa.problems.filter((p) => inRange(p.date, start, end)).length;
  const apps = state.internships.applications.filter((a) => inRange(a.date, start, end));
  const applications = apps.length;
  const interviews = apps.filter((a) => a.status === "interview" || a.status === "offer").length;

  let tasksCompleted = 0;
  state.projects.forEach((p) => {
    p.tasks.forEach((t) => {
      if (t.done && t.doneAt && inRange(t.doneAt, start, end)) tasksCompleted++;
    });
  });

  const journalEntries = state.journal.filter((j) => inRange(j.date, start, end)).length;
  const workouts = state.fitness.workouts.filter((w) => inRange(w.date, start, end)).length;

  return {
    key,
    label,
    weightAvg,
    weightDelta: null, // filled in by caller
    dsaCount,
    applications,
    interviews,
    tasksCompleted,
    journalEntries,
    workouts,
  };
}

export function buildWeeklySnapshots(state: GameState, count = 12): Snapshot[] {
  const out: Snapshot[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const start = new Date(now);
    start.setDate(start.getDate() - i * 7);
    const ws = new Date(isoWeek(start));
    const we = new Date(ws);
    we.setDate(we.getDate() + 7);
    out.push(
      snapshotFor(
        state,
        ws,
        we,
        ws.toISOString().slice(0, 10),
        `Week of ${ws.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
      ),
    );
  }
  for (let i = 0; i < out.length - 1; i++) {
    if (out[i].weightAvg !== null && out[i + 1].weightAvg !== null) {
      out[i].weightDelta = +(out[i].weightAvg! - out[i + 1].weightAvg!).toFixed(2);
    }
  }
  return out;
}

export function buildMonthlySnapshots(state: GameState, count = 12): Snapshot[] {
  const out: Snapshot[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    out.push(
      snapshotFor(
        state,
        ref,
        next,
        isoMonth(ref),
        ref.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
      ),
    );
  }
  for (let i = 0; i < out.length - 1; i++) {
    if (out[i].weightAvg !== null && out[i + 1].weightAvg !== null) {
      out[i].weightDelta = +(out[i].weightAvg! - out[i + 1].weightAvg!).toFixed(2);
    }
  }
  return out;
}

// ===== Time Machine =====
export interface TimeMachineSnapshot {
  asOf: string;
  weight: number | null;
  dsaTotal: number;
  applicationsTotal: number;
  offersTotal: number;
  goalsCompleted: number;
  projectsActive: number;
  tasksCompleted: number;
  milestonesCompleted: number;
}

export function timeMachine(state: GameState, asOf: string): TimeMachineSnapshot {
  const cutoff = new Date(asOf).getTime() + 86400000; // end of that day

  const weightHist = state.fitness.history
    .filter((h) => new Date(h.date).getTime() < cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));
  const weight = weightHist.length ? weightHist[weightHist.length - 1].weight : null;

  const dsaTotal = state.dsa.problems.filter((p) => new Date(p.date).getTime() < cutoff).length;
  const apps = state.internships.applications.filter((a) => new Date(a.date).getTime() < cutoff);
  const applicationsTotal = apps.length;
  const offersTotal = apps.filter((a) => a.status === "offer").length;

  const goalsCompleted = state.goals.filter(
    (g) =>
      g.milestones.length > 0 &&
      g.milestones.every((m) => m.done && m.date && new Date(m.date).getTime() < cutoff),
  ).length;

  const projectsActive = state.projects.filter(
    (p) => new Date(p.createdAt).getTime() < cutoff,
  ).length;

  let tasksCompleted = 0;
  let milestonesCompleted = 0;
  state.projects.forEach((p) => {
    p.tasks.forEach((t) => {
      if (t.done && t.doneAt && new Date(t.doneAt).getTime() < cutoff) tasksCompleted++;
    });
    p.milestones.forEach((m) => {
      if (m.done && m.date && new Date(m.date).getTime() < cutoff) milestonesCompleted++;
    });
  });

  return {
    asOf,
    weight,
    dsaTotal,
    applicationsTotal,
    offersTotal,
    goalsCompleted,
    projectsActive,
    tasksCompleted,
    milestonesCompleted,
  };
}
