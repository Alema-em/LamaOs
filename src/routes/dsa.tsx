import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useGame } from "@/hooks/use-game";
import {
  DSA_TOPICS,
  dsaStreak,
  dsaTopicCoverageRows,
  buildDsaActivityGrid,
} from "@/lib/dsa-topics";
import { utcCalendarDateKey } from "@/lib/dates";
import { clampPercent, dsaGoalPercent, safePercentage } from "@/lib/progress";
import { PageHeader, Section, Panel, Stat } from "@/components/ui-kit";
import { DsaActivityGrid } from "@/components/DsaActivityGrid";
import { Code2, Trash2 } from "lucide-react";

export const Route = createFileRoute("/dsa")({
  head: () => ({ meta: [{ title: "DSA — LamaOS" }] }),
  component: Dsa,
});

const TOPICS = DSA_TOPICS;

function Dsa() {
  const { state, logProblem, deleteProblem, setDsaGoal } = useGame();
  const ps = state.dsa.problems;
  const pct = dsaGoalPercent(ps.length, state.dsa.goal);
  const streakDays = useMemo(() => dsaStreak(ps), [ps]);

  const easy = ps.filter((p) => p.difficulty === "easy").length;
  const med = ps.filter((p) => p.difficulty === "medium").length;
  const hard = ps.filter((p) => p.difficulty === "hard").length;

  const byTopic = useMemo(() => dsaTopicCoverageRows(ps), [ps]);

  const days = useMemo(() => buildDsaActivityGrid(ps, 12), [ps]);

  // Forecast: rate over last 14 calendar days → days until goal
  const forecast = useMemo(() => {
    if (!state.dsa.goal || ps.length < 1) return null;
    const left = state.dsa.goal - ps.length;
    if (left <= 0) return null;
    const cutoffKey = utcCalendarDateKey(new Date(Date.now() - 14 * 86400000));
    const recent = ps.filter((p) => (p.date?.slice(0, 10) ?? "") >= cutoffKey).length;
    if (recent < 1) return null;
    const perDay = recent / 14;
    const days = Math.ceil(left / perDay);
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + days);
    return { perDay: +perDay.toFixed(2), date: utcCalendarDateKey(d), days };
  }, [ps, state.dsa.goal]);

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [diff, setDiff] = useState<"easy" | "medium" | "hard">("medium");
  const [goalInput, setGoalInput] = useState<number | "">(state.dsa.goal || "");

  return (
    <div>
      <PageHeader
        eyebrow="Craft"
        title="DSA"
        subtitle="Patient repetitions. The forest grows quietly."
      />

      <Section className="grid grid-cols-2 gap-x-10 gap-y-8 border-b border-border md:grid-cols-4">
        <Stat
          label="Solved"
          value={ps.length}
          sub={state.dsa.goal > 0 ? `Goal ${state.dsa.goal}` : "Set a goal"}
        />
        <Stat
          label="Progress"
          value={state.dsa.goal > 0 ? `${Math.round(pct)}%` : "No data available"}
          accent
        />
        <Stat label="Difficulty mix" value={`${easy}·${med}·${hard}`} sub="easy · medium · hard" />
        <Stat label="Streak" value={`${streakDays}d`} sub="Days with a problem logged" />
      </Section>

      {state.dsa.goal === 0 && (
        <Section>
          <Panel title="Set a goal" hint="Begin">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Total problems to solve</label>
                <input
                  type="number"
                  min={1}
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value === "" ? "" : +e.target.value)}
                  className="mt-1 w-40 rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={() => {
                  if (typeof goalInput === "number" && goalInput > 0) setDsaGoal(goalInput);
                }}
                className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
              >
                Save goal
              </button>
              <p className="text-xs text-muted-foreground">
                A simple number to aim at. You can change it anytime.
              </p>
            </div>
          </Panel>
        </Section>
      )}

      <Section className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Activity" hint="Last 12 weeks">
          {ps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Log your first problem to start building your activity grid.
            </div>
          ) : (
            <>
              <DsaActivityGrid cells={days} animate />
              <div className="mt-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Less
                {[0, 1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className="h-3 w-3 rounded-[3px]"
                    style={{
                      background:
                        n === 0
                          ? "color-mix(in oklab, var(--foreground) 5%, transparent)"
                          : `color-mix(in oklab, var(--gold) ${30 + n * 22}%, transparent)`,
                    }}
                  />
                ))}
                More
              </div>
              {forecast && (
                <div className="mt-4 rounded-xl border border-border bg-background/60 px-4 py-3 text-xs text-muted-foreground">
                  Solving ~{forecast.perDay}/day — you'll hit your goal around{" "}
                  <span className="text-foreground font-medium">{forecast.date}</span> (
                  {forecast.days} days).
                </div>
              )}
            </>
          )}
        </Panel>

        <Panel title="Log a problem" hint="Now">
          <div className="space-y-3">
            <input
              placeholder="Problem title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {TOPICS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDiff(d)}
                  className={`rounded-md border px-2 py-2 text-xs capitalize transition ${diff === d ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {d}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                if (!title.trim()) return;
                logProblem({ title: title.trim(), topic, difficulty: diff });
                setTitle("");
              }}
              className="w-full rounded-md bg-foreground py-2 text-sm text-background transition hover:opacity-90"
            >
              Add
            </button>
          </div>
        </Panel>
      </Section>

      <Section className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Recent" hint={`${ps.length}`}>
          {ps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Nothing logged yet — your first solved problem will land here.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {ps.slice(0, 12).map((p) => (
                <div key={p.id} className="group flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.topic} · {p.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                        p.difficulty === "hard"
                          ? "bg-destructive/15 text-destructive"
                          : p.difficulty === "medium"
                            ? "bg-accent/20 text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.difficulty}
                    </span>
                    <button
                      onClick={() => deleteProblem(p.id)}
                      className="text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Topics" hint="Coverage">
          {ps.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Topic coverage appears once you start logging.
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {byTopic.map(({ topic, count }) => {
                const max = Math.max(1, ...byTopic.map((r) => r.count));
                return (
                  <div key={topic}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span>{topic}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground/80 transition-[width] duration-300 ease-out"
                        style={{ width: `${safePercentage(count, max)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </Section>
    </div>
  );
}
