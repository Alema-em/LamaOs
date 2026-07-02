import { createFileRoute, Link, type LinkProps } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/hooks/use-game";
import { PageHeader, Section, Panel, Stat } from "@/components/ui-kit";
import {
  buildEvents,
  buildWeeklySnapshots,
  buildMonthlySnapshots,
  timeMachine,
  type TimelineEvent,
  type Snapshot,
} from "@/lib/history";
import {
  Activity,
  Code2,
  Target,
  FolderKanban,
  Briefcase,
  BookOpen,
  Trophy,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — LamaOS" }] }),
  component: History,
});

const TABS = ["Activity", "Timeline", "Snapshots", "Time Machine"] as const;
type Tab = (typeof TABS)[number];

const ICONS: Record<TimelineEvent["category"], React.ComponentType<{ className?: string }>> = {
  fitness: Activity,
  workout: Activity,
  goal: Target,
  milestone: CheckCircle2,
  project: FolderKanban,
  task: CheckCircle2,
  dsa: Code2,
  application: Briefcase,
  journal: BookOpen,
  achievement: Trophy,
};

function relativeDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const diff = Math.round((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.round(diff / 7)}w ago`;
  if (diff < 365) return `${Math.round(diff / 30)}mo ago`;
  return `${Math.round(diff / 365)}y ago`;
}

function History() {
  const { state } = useGame();
  const [tab, setTab] = useState<Tab>("Activity");

  const events = useMemo(() => buildEvents(state), [state]);
  const weekly = useMemo(() => buildWeeklySnapshots(state, 12), [state]);
  const monthly = useMemo(() => buildMonthlySnapshots(state, 12), [state]);

  return (
    <div>
      <PageHeader
        eyebrow="Your Journey"
        title="History"
        subtitle="Every event, snapshot and chapter of your progress over time."
      />

      <Section className="grid grid-cols-2 gap-x-10 gap-y-8 border-b border-border md:grid-cols-4">
        <Stat label="Total events" value={events.length} />
        <Stat label="Weight logs" value={state.fitness.history.length} />
        <Stat label="DSA solved" value={state.dsa.problems.length} accent />
        <Stat label="Applications" value={state.internships.applications.length} />
      </Section>

      <Section>
        <div className="mb-6 flex flex-wrap gap-2 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm transition border-b-2 -mb-px ${
                tab === t
                  ? "border-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Activity" && <ActivityFeed events={events} />}
        {tab === "Timeline" && <Timeline events={events} />}
        {tab === "Snapshots" && <Snapshots weekly={weekly} monthly={monthly} />}
        {tab === "Time Machine" && <TimeMachineView />}
      </Section>
    </div>
  );
}

function ActivityFeed({ events }: { events: TimelineEvent[] }) {
  const [limit, setLimit] = useState(50);
  const visible = events.slice(0, limit);

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
        Nothing recorded yet. As you log weight, solve problems, apply to roles, complete tasks and
        write journal entries, they'll appear here.
      </div>
    );
  }

  return (
    <div className="space-y-2 pb-16">
      {visible.map((e) => {
        const Icon = ICONS[e.category];
        return (
          <Link
            key={e.id}
            to={(e.link ?? "/") as LinkProps["to"]}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition hover:bg-card/60"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-medium">{e.title}</div>
                <div className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {relativeDate(e.date)}
                </div>
              </div>
              {e.detail && <div className="truncate text-xs text-muted-foreground">{e.detail}</div>}
            </div>
          </Link>
        );
      })}
      {limit < events.length && (
        <button
          onClick={() => setLimit((l) => l + 50)}
          className="mx-auto mt-4 block rounded-md border border-border px-4 py-2 text-sm hover:bg-foreground hover:text-background"
        >
          Load more ({events.length - limit} remaining)
        </button>
      )}
    </div>
  );
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    events.forEach((e) => {
      const key = e.date ? e.date.slice(0, 7) : "Undated";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return [...map.entries()];
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
        Your timeline is empty. Start logging to fill it.
      </div>
    );
  }

  return (
    <div className="pb-16">
      {grouped.map(([month, items]) => (
        <div key={month} className="mb-8">
          <div className="mb-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {month === "Undated"
              ? "Undated"
              : new Date(month + "-01").toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
          </div>
          <div className="relative space-y-3 border-l border-border pl-6">
            {items.map((e, i) => {
              const Icon = ICONS[e.category];
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="relative"
                >
                  <div className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background">
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium">{e.title}</div>
                      <div className="text-[10px] text-muted-foreground">{e.date || "—"}</div>
                    </div>
                    {e.detail && <div className="text-xs text-muted-foreground">{e.detail}</div>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Snapshots({ weekly, monthly }: { weekly: Snapshot[]; monthly: Snapshot[] }) {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const data = period === "weekly" ? weekly : monthly;

  return (
    <div className="pb-16">
      <div className="mb-4 inline-flex rounded-md border border-border">
        <button
          onClick={() => setPeriod("weekly")}
          className={`px-3 py-1.5 text-xs ${period === "weekly" ? "bg-foreground text-background" : ""}`}
        >
          Weekly
        </button>
        <button
          onClick={() => setPeriod("monthly")}
          className={`px-3 py-1.5 text-xs ${period === "monthly" ? "bg-foreground text-background" : ""}`}
        >
          Monthly
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {data.map((s) => (
          <Panel key={s.key} title={s.label} hint={period === "weekly" ? "Week" : "Month"}>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <Metric
                label="Weight avg"
                value={s.weightAvg !== null ? `${s.weightAvg}kg` : "—"}
                delta={s.weightDelta}
                invertDelta
              />
              <Metric label="DSA" value={s.dsaCount} />
              <Metric label="Applications" value={s.applications} />
              <Metric label="Interviews" value={s.interviews} />
              <Metric label="Tasks done" value={s.tasksCompleted} />
              <Metric label="Workouts" value={s.workouts} />
              <Metric label="Journal" value={s.journalEntries} />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  delta,
  invertDelta,
}: {
  label: string;
  value: string | number;
  delta?: number | null;
  invertDelta?: boolean;
}) {
  const showDelta = delta !== undefined && delta !== null && delta !== 0;
  const positive = invertDelta ? (delta ?? 0) < 0 : (delta ?? 0) > 0;
  return (
    <div className="rounded-lg border border-border bg-background/60 p-2">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-1 text-sm font-medium">
        {value}
        {showDelta && (
          <span
            className={`flex items-center text-[10px] ${positive ? "text-sage" : "text-destructive"}`}
          >
            {(delta ?? 0) > 0 ? (
              <ArrowUp className="h-2.5 w-2.5" />
            ) : (
              <ArrowDown className="h-2.5 w-2.5" />
            )}
            {Math.abs(delta ?? 0)}
          </span>
        )}
      </div>
    </div>
  );
}

function TimeMachineView() {
  const { state } = useGame();
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const snap = useMemo(() => timeMachine(state, date), [state, date]);

  return (
    <div className="pb-16">
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Revisit your stats as of
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Weight" value={snap.weight !== null ? `${snap.weight}kg` : "—"} />
        <Stat label="DSA solved" value={snap.dsaTotal} accent />
        <Stat label="Applications" value={snap.applicationsTotal} />
        <Stat label="Offers" value={snap.offersTotal} />
        <Stat label="Goals completed" value={snap.goalsCompleted} />
        <Stat label="Projects active" value={snap.projectsActive} />
        <Stat label="Tasks done" value={snap.tasksCompleted} />
        <Stat label="Milestones" value={snap.milestonesCompleted} />
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-border bg-card/40 p-4 text-xs text-muted-foreground">
        Snapshot is calculated live from your historical data — nothing is overwritten, so you can
        travel to any date and see exactly where you stood.
      </div>
    </div>
  );
}
