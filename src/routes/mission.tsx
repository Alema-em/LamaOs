import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useGame, goalProgress, type Goal } from "@/hooks/use-game";
import { clampPercent, averagePercent } from "@/lib/progress";
import { PageHeader, Section, Panel, Stat } from "@/components/ui-kit";
import { CheckCircle2, AlertCircle, Calendar, Target, Plus } from "lucide-react";

export const Route = createFileRoute("/mission")({
  head: () => ({ meta: [{ title: "Mission Control — LamaOS" }] }),
  component: MissionControl,
});

interface MissionGoal {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  progress: number;
  onTrack: boolean | null;
  forecast?: string;
  nextAction: string;
  daysLeft?: number;
}

function buildMission(goals: Goal[]): MissionGoal[] {
  const today = new Date();
  return goals.map((g) => {
    const progress = goalProgress(g);
    let onTrack: boolean | null = null;
    let forecast: string | undefined;
    let daysLeft: number | undefined;

    if (g.targetDate) {
      const start = new Date(g.createdAt).getTime();
      const end = new Date(g.targetDate).getTime();
      const total = Math.max(1, end - start);
      const elapsed = Math.max(0, today.getTime() - start);
      const expectedPct = Math.min(100, (elapsed / total) * 100);
      onTrack = progress >= expectedPct - 10;
      daysLeft = Math.round((end - today.getTime()) / 86400000);
      forecast = daysLeft >= 0 ? `${daysLeft}d to deadline` : `${Math.abs(daysLeft)}d overdue`;
    }

    const nextMs = g.milestones.find((m) => !m.done);
    const nextAction = nextMs
      ? nextMs.title
      : g.milestones.length === 0
        ? "Add a milestone to break this down"
        : "All milestones complete — close this goal";

    return {
      id: g.id,
      category: g.category || "Goal",
      title: g.title,
      subtitle: g.description || (g.targetDate ? `Target ${g.targetDate}` : "No deadline set"),
      progress,
      onTrack,
      forecast,
      nextAction,
      daysLeft,
    };
  });
}

function MissionControl() {
  const { state } = useGame();
  const activeGoals = useMemo(() => state.goals.filter((g) => !g.archived), [state.goals]);
  const mission = useMemo(() => buildMission(activeGoals), [activeGoals]);

  const completion = averagePercent(mission.map((g) => g.progress));
  const onTrackCount = mission.filter((g) => g.onTrack === true).length;
  const trackable = mission.filter((g) => g.onTrack !== null).length;
  const soonest = mission
    .filter((g) => g.daysLeft !== undefined && g.daysLeft >= 0)
    .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0))[0];

  return (
    <div>
      <PageHeader
        eyebrow="Your Goals"
        title="Mission Control"
        subtitle="A live view of every goal you've set. Progress, pace, and what to do next."
      />

      {mission.length === 0 ? (
        <Section className="pb-16">
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
            <Target className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <h3 className="font-display text-2xl">Mission Control is empty</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              This space tracks the goals you set for yourself — your progress, your pace, and what
              to do next. Create your first goal to see it light up here.
            </p>
            <Link
              to="/goals"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Create your first goal
            </Link>
          </div>
        </Section>
      ) : (
        <>
          <Section className="grid grid-cols-2 gap-x-10 gap-y-8 border-b border-border md:grid-cols-4">
            <Stat label="Active goals" value={mission.length} />
            <Stat label="Avg completion" value={`${Math.round(completion)}%`} accent />
            <Stat
              label="On track"
              value={trackable ? `${onTrackCount}/${trackable}` : "—"}
              sub={trackable ? "Goals with deadlines" : "No deadlines set"}
            />
            <Stat
              label="Next deadline"
              value={soonest ? `${soonest.daysLeft}d` : "—"}
              sub={soonest ? soonest.title.slice(0, 24) : "No upcoming deadline"}
            />
          </Section>

          <Section className="pb-16">
            <div className="grid gap-4 md:grid-cols-2">
              {mission.map((g, i) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        {g.category}
                      </div>
                      <div className="mt-1 font-display text-xl">{g.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{g.subtitle}</div>
                    </div>
                    {g.onTrack !== null && (
                      <div
                        className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] uppercase tracking-wider ${
                          g.onTrack
                            ? "border-sage/40 bg-sage/10 text-sage"
                            : "border-destructive/30 bg-destructive/5 text-destructive"
                        }`}
                      >
                        {g.onTrack ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {g.onTrack ? "On track" : "Behind"}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                        g.onTrack === false ? "bg-destructive/70" : "bg-foreground/80"
                      }`}
                      style={{ width: `${clampPercent(g.progress)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{Math.round(g.progress)}%</span>
                    {g.forecast && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {g.forecast}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl border border-dashed border-border bg-background/50 p-3 text-xs">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Next action
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <span>{g.nextAction}</span>
                      <Link
                        to="/goals"
                        className="shrink-0 rounded-md border border-border px-2 py-1 hover:bg-foreground hover:text-background"
                      >
                        Open →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}
