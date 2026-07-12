import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import {
  useGame,
  dailyScore,
  fitnessWindowScore,
  fitnessHabitStreak,
  FITNESS_STREAK_THRESHOLD,
  today,
  calorieBarWidth,
  calorieInSuccessBand,
  calorieStatusText,
  type FitnessTargets,
  type DailyLog,
} from "@/hooks/use-game";
import { forecastWeight, projectGoalDate } from "@/lib/forecast";
import { clampPercent, hasWeightSetup, weightJourneyMetrics } from "@/lib/progress";
import { PageHeader, Section, Panel, Stat } from "@/components/ui-kit";
import {
  Plus,
  Activity,
  Dumbbell,
  Scale,
  Droplets,
  Footprints,
  Moon,
  Flame,
  Beef,
  Check,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/fitness")({
  head: () => ({ meta: [{ title: "Fitness — LamaOS" }] }),
  component: Fitness,
});

const TODAY = today;

function Fitness() {
  const {
    state,
    logWeight,
    logWorkout,
    logDaily,
    setFitnessTargets,
    updateFitnessTargets,
    flushSave,
    syncStatus,
  } = useGame();
  const f = state.fitness;
  const [selectedDate, setSelectedDate] = useState(() => today());
  const [saveBusy, setSaveBusy] = useState(false);

  useEffect(() => {
    return () => {
      void flushSave().catch(() => undefined);
    };
  }, [flushSave]);

  const handleSaveDay = useCallback(async () => {
    setSaveBusy(true);
    try {
      await flushSave();
    } finally {
      setSaveBusy(false);
    }
  }, [flushSave]);

  const syncHint =
    syncStatus === "saving" || saveBusy
      ? "Saving…"
      : syncStatus === "error"
        ? "Save failed"
        : syncStatus === "saved"
          ? "Saved"
          : null;

  const weightSetupReady = hasWeightSetup(f.start, f.current, f.goal);

  const year = new Date().getFullYear();
  const aug31 = `${year}-08-31`;
  const dec31 = `${year}-12-31`;

  const forecast = useMemo(() => projectGoalDate(f.history, f.goal), [f.history, f.goal]);
  const augForecast = useMemo(() => forecastWeight(f.history, aug31), [f.history, aug31]);
  const decForecast = useMemo(() => forecastWeight(f.history, dec31), [f.history, dec31]);
  const validWeightEntries = useMemo(
    () => f.history.filter((h) => typeof h.weight === "number" && h.weight > 0 && h.date),
    [f.history],
  );
  const forecastReady = validWeightEntries.length >= 2;

  const [weight, setW] = useState<number | "">(f.current || "");
  const [workoutType, setType] = useState("Strength");
  const [minutes, setMin] = useState(45);

  useEffect(() => {
    if (f.current > 0) setW(f.current);
  }, [f.current]);

  if (!weightSetupReady) {
    return <SetupFitness fitness={f} onSave={setFitnessTargets} />;
  }

  const { lost, remaining, journeyPct, remainingPct } = weightJourneyMetrics(
    f.start,
    f.current,
    f.goal,
  );
  const data = f.history.map((h) => ({ date: h.date.slice(5), weight: h.weight }));

  // Required pace vs current pace
  const kgLeft = Math.max(0, f.current - f.goal);
  const daysToGoal = Math.max(1, Math.round((new Date(aug31).getTime() - Date.now()) / 86400000));
  const requiredPerWeek = kgLeft === 0 ? 0 : +((kgLeft / daysToGoal) * 7).toFixed(2);
  const currentPace = forecast?.perWeek ?? 0;
  const onTrack =
    kgLeft === 0 || (forecastReady && !!forecast && new Date(forecast.date) <= new Date(aug31));

  // Daily streaks & scores
  const todayLog = f.daily.find((d) => d.date === TODAY());
  const viewLog = f.daily.find((d) => d.date === selectedDate);
  const score = dailyScore(viewLog, f.targets);

  const weekScore = fitnessWindowScore(f.daily, f.targets, 7);
  const monthScore = fitnessWindowScore(f.daily, f.targets, 30);
  const habitStreak = fitnessHabitStreak(f.daily, f.targets);

  // Recommendations
  const recs = buildRecommendations(todayLog, f.targets, {
    onTrack: !!onTrack,
    currentPace,
    requiredPerWeek,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Wellbeing"
        title="Fitness"
        subtitle="The body carries the dream. Quiet, consistent, daily."
      />

      <Section className="grid grid-cols-2 gap-x-10 gap-y-8 border-b border-border md:grid-cols-4">
        <Stat label="Current" value={`${f.current}kg`} />
        <Stat label="Goal" value={`${f.goal}kg`} sub={`Started at ${f.start}kg`} />
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Lost
          </div>
          <div className="mt-2 font-display text-3xl tracking-tight">{lost}kg</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {journeyPct === 0 && lost === 0
              ? "Log a lower weigh-in to begin"
              : `${Math.round(journeyPct)}% of journey`}
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent/80 transition-[width] duration-300 ease-out"
              style={{ width: `${journeyPct}%` }}
            />
          </div>
        </div>
        <Stat
          label="Remaining"
          value={`${remaining}kg`}
          sub={f.start !== f.goal ? `${Math.round(remainingPct)}% to go` : undefined}
        />
      </Section>

      {/* Pace / forecast */}
      <Section className="border-b border-border">
        <Panel title="Pace check" hint="vs Aug 31">
          {!forecastReady ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Log at least 2 weigh-ins to unlock forecast.
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-4">
                <Stat
                  label={`Forecast Aug 31, ${year}`}
                  value={augForecast !== null ? `${augForecast}kg` : "—"}
                  sub="Linear projection"
                />
                <Stat
                  label={`Forecast Dec 31, ${year}`}
                  value={decForecast !== null ? `${decForecast}kg` : "—"}
                  sub="If pace holds"
                />
                <Stat
                  label="Required pace"
                  value={requiredPerWeek > 0 ? `${requiredPerWeek}kg/wk` : "Goal reached"}
                  sub="To hit Aug 31"
                />
                <Stat
                  label="Status"
                  value={
                    <span className={onTrack ? "text-sage" : "text-destructive"}>
                      {onTrack ? "On track" : "Behind"}
                    </span>
                  }
                  sub={currentPace > 0 ? `Currently ${currentPace}kg/wk` : "Log more weights"}
                />
              </div>
              {forecast && (
                <div className="mt-4 rounded-xl border border-border bg-background/60 px-4 py-3 text-xs text-muted-foreground">
                  At your current pace, you'll reach your goal around{" "}
                  <span className="font-medium text-foreground">{forecast.date}</span> —{" "}
                  {forecast.daysLeft} days away.
                </div>
              )}
            </>
          )}
        </Panel>
      </Section>

      {/* Recommendations */}
      {recs.length > 0 && (
        <Section className="border-b border-border">
          <Panel title="Recommendations" hint="Personalized">
            <ul className="space-y-2">
              {recs.map((r, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                    r.tone === "good"
                      ? "border-sage/40 bg-sage/5"
                      : r.tone === "warn"
                        ? "border-destructive/30 bg-destructive/5"
                        : "border-border"
                  }`}
                >
                  <span
                    className={`mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full ${
                      r.tone === "good"
                        ? "bg-sage"
                        : r.tone === "warn"
                          ? "bg-destructive"
                          : "bg-foreground/60"
                    }`}
                  />
                  <span>{r.text}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </Section>
      )}

      {/* Trend + daily log */}
      <Section className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Trend" hint={`${data.length} entries`}>
          {data.length < 2 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Log a few more weights to see your trend appear here.
            </div>
          ) : (
            <div className="h-72 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="fitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[Math.min(f.goal, ...data.map((d) => d.weight)) - 1, "dataMax + 1"]}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <ReferenceLine
                    y={f.goal}
                    stroke="var(--lavender)"
                    strokeDasharray="4 4"
                    label={{
                      value: `Goal ${f.goal}kg`,
                      fontSize: 10,
                      fill: "var(--muted-foreground)",
                      position: "insideBottomRight",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--gold)"
                    strokeWidth={2.5}
                    fill="url(#fitGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title="Log weight" hint="Daily">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Weight (kg)</label>
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setW(e.target.value === "" ? "" : +e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <button
                  onClick={() => {
                    if (typeof weight === "number" && weight > 0) logWeight(weight);
                  }}
                  className="rounded-md bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90"
                >
                  Log
                </button>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <label className="text-xs text-muted-foreground">Quick workout</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {["Strength", "Run", "Walk"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`rounded-md border px-2 py-2 text-xs transition ${workoutType === t ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={minutes}
                  onChange={(e) => setMin(+e.target.value || 0)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <button
                  onClick={() => {
                    if (minutes > 0) logWorkout(workoutType, minutes);
                  }}
                  className="rounded-md border border-border px-4 py-2 text-sm transition hover:bg-foreground hover:text-background"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Panel>
      </Section>

      {/* Daily checklist + scores */}
      <Section className="grid gap-6 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title={selectedDate === TODAY() ? "Today's checklist" : "Daily checklist"}
          hint={selectedDate === TODAY() ? `${score}%` : selectedDate}
        >
          <DailyChecklist
            log={viewLog}
            targets={f.targets}
            onChange={(patch) => logDaily(patch, selectedDate)}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <button
              type="button"
              disabled={saveBusy || syncStatus === "loading"}
              onClick={() => void handleSaveDay()}
              className="rounded-md bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90 disabled:opacity-50"
            >
              {selectedDate === TODAY() ? "Save today" : "Save day"}
            </button>
            {syncHint && (
              <span
                className={`text-xs ${syncStatus === "error" ? "text-destructive" : "text-muted-foreground"}`}
              >
                {syncHint}
              </span>
            )}
          </div>
          <StepHistoryCalendar
            daily={f.daily}
            stepTarget={f.targets.steps}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </Panel>

        <Panel title="Scores" hint="Habits">
          <div className="space-y-5">
            <ScoreRow label="Today" value={score} sub="vs daily targets" />
            <ScoreRow label="Past 7 days" value={weekScore} sub="Avg on days you logged" />
            <ScoreRow label="Past 30 days" value={monthScore} sub="Avg on days you logged" />
            <div className="rounded-lg border border-border bg-background/60 px-3 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Habit streak
              </div>
              <div className="mt-1 flex items-center gap-2 font-display text-2xl">
                <Flame className="h-5 w-5 text-accent" /> {habitStreak} days
              </div>
              <div className="text-[11px] text-muted-foreground">
                Days you hit ≥{FITNESS_STREAK_THRESHOLD}% on logged days.
              </div>
            </div>
          </div>
        </Panel>
      </Section>

      {/* Weight journey targets */}
      <Section>
        <Panel title="Weight targets" hint="Start · current · goal">
          <WeightTargetsEditor
            start={f.start}
            current={f.current}
            goal={f.goal}
            onSave={setFitnessTargets}
          />
        </Panel>
      </Section>

      {/* Targets */}
      <Section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Daily targets" hint="Tune to you">
          <TargetsEditor targets={f.targets} onChange={updateFitnessTargets} />
        </Panel>
        <Panel title="Recent workouts" hint="Last sessions">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {f.workouts.length === 0 && (
              <div className="text-sm text-muted-foreground">No workouts logged yet.</div>
            )}
            {f.workouts.slice(0, 10).map((w) => (
              <div
                key={w.id}
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
              >
                <div className="grid h-9 w-9 place-items-center rounded-md bg-muted">
                  {w.type === "Run" ? (
                    <Activity className="h-4 w-4" />
                  ) : (
                    <Dumbbell className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{w.type}</div>
                  <div className="text-xs text-muted-foreground">
                    {w.date} · {w.minutes} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </Section>

      {/* Milestones */}
      <Section className="pb-16">
        <Panel title="Milestones" hint="Journey">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { kg: 1, label: "First kilogram" },
              { kg: 5, label: "Five down" },
              { kg: 10, label: "Double digits" },
              { kg: Math.max(1, f.start - f.goal), label: "Goal weight" },
            ].map((m, i) => {
              const reached = lost >= m.kg;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 ${reached ? "border-accent/40 bg-accent/10" : "border-border"}`}
                >
                  <div>
                    <div className="text-sm font-medium">{m.label}</div>
                    <div className="text-xs text-muted-foreground">Lose {m.kg}kg</div>
                  </div>
                  <div
                    className={`text-xs font-medium ${reached ? "text-accent-foreground" : "text-muted-foreground"}`}
                  >
                    {reached ? "Reached" : `${Math.max(0, +(m.kg - lost).toFixed(1))}kg to go`}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Panel>
      </Section>
    </div>
  );
}

// ============================================
// helpers
// ============================================
function buildRecommendations(
  log: DailyLog | undefined,
  t: FitnessTargets,
  pace: { onTrack: boolean; currentPace: number; requiredPerWeek: number },
) {
  const out: { text: string; tone: "good" | "warn" | "info" }[] = [];
  if (!log) {
    out.push({ text: "Log today's habits to get personalized recommendations.", tone: "info" });
  } else {
    if (log.steps !== undefined && log.steps < t.steps - 2000) {
      out.push({
        text: `Increase daily steps by ${(t.steps - log.steps).toLocaleString()}.`,
        tone: "warn",
      });
    }
    if (log.protein !== undefined && log.protein < t.protein * 0.8) {
      out.push({
        text: `Protein intake is below target (${log.protein}g / ${t.protein}g).`,
        tone: "warn",
      });
    }
    if (log.water !== undefined && log.water < t.water * 0.7) {
      out.push({
        text: `Hydration is low — aim for another ${(t.water - log.water).toFixed(1)}L of water.`,
        tone: "warn",
      });
    }
    if (log.sleep !== undefined && log.sleep < t.sleep - 1) {
      out.push({ text: `Sleep is below target — try for ${t.sleep}h tonight.`, tone: "warn" });
    }
    if (log.calories !== undefined && log.calories > t.calories + 300) {
      out.push({
        text: `Calories ${log.calories - t.calories} over target — consider a lighter dinner.`,
        tone: "warn",
      });
    }
  }
  if (pace.requiredPerWeek === 0) {
    /* at or below goal — no pace nudges */
  } else if (pace.onTrack) {
    out.push({
      text: `You're currently ahead of schedule (${pace.currentPace}kg/wk vs ${pace.requiredPerWeek}kg/wk needed).`,
      tone: "good",
    });
  } else if (pace.currentPace > 0) {
    out.push({
      text: `Current pace ${pace.currentPace}kg/wk is below the ${pace.requiredPerWeek}kg/wk needed by Aug 31.`,
      tone: "warn",
    });
  }
  return out.slice(0, 5);
}

// ============================================
// Daily checklist
// ============================================
function DailyChecklist({
  log,
  targets,
  onChange,
}: {
  log: DailyLog | undefined;
  targets: FitnessTargets;
  onChange: (p: Partial<Omit<DailyLog, "date">>) => void;
}) {
  const items: {
    key: keyof DailyLog;
    label: string;
    icon: LucideIcon;
    unit: string;
    target: number;
    step?: number;
  }[] = [
    {
      key: "calories",
      label: "Calories",
      icon: Flame,
      unit: "kcal",
      target: targets.calories,
      step: 50,
    },
    { key: "protein", label: "Protein", icon: Beef, unit: "g", target: targets.protein, step: 5 },
    { key: "water", label: "Water", icon: Droplets, unit: "L", target: targets.water, step: 0.25 },
    { key: "steps", label: "Steps", icon: Footprints, unit: "", target: targets.steps, step: 500 },
    { key: "sleep", label: "Sleep", icon: Moon, unit: "h", target: targets.sleep, step: 0.25 },
    {
      key: "walkMin",
      label: "Walk",
      icon: Activity,
      unit: "min",
      target: targets.walkMinDaily,
      step: 5,
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((it) => {
        const raw = log?.[it.key] as number | undefined;
        const v = raw ?? 0;
        const isCalories = it.key === "calories";
        const calOver = isCalories && raw !== undefined && raw > targets.calories * 1.05;
        const hit = isCalories
          ? calorieInSuccessBand(raw, targets.calories)
          : raw !== undefined && raw >= it.target;
        const barPct = clampPercent(
          isCalories
            ? calorieBarWidth(raw, targets.calories)
            : it.target
              ? (v / it.target) * 100
              : 0,
        );
        const statusText = isCalories ? calorieStatusText(raw, targets.calories) : null;
        const Icon = it.icon;
        const cardClass = calOver
          ? "border-destructive/40 bg-destructive/5"
          : hit
            ? "border-sage/40 bg-sage/5"
            : "border-border";
        const barClass = calOver
          ? "bg-destructive/70"
          : hit
            ? "bg-foreground/70"
            : "bg-foreground/70";

        return (
          <div key={it.key} className={`rounded-xl border px-4 py-3 ${cardClass}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4 text-muted-foreground" /> {it.label}
              </div>
              {hit && <Check className="h-4 w-4 text-sage" />}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min={0}
                step={it.step ?? 1}
                value={raw ?? ""}
                onChange={(e) =>
                  onChange({
                    [it.key]: e.target.value === "" ? undefined : +e.target.value,
                  } as Partial<Omit<DailyLog, "date">>)
                }
                placeholder="0"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              />
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                / {it.target}
                {it.unit}
              </div>
            </div>
            {statusText && (
              <div
                className={`mt-1 text-[11px] ${calOver ? "text-destructive" : "text-muted-foreground"}`}
              >
                {statusText}
              </div>
            )}
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-[width] duration-300 ease-out ${barClass}`}
                style={{ width: `${barPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StepHistoryCalendar({
  daily,
  stepTarget,
  selectedDate,
  onSelectDate,
}: {
  daily: DailyLog[];
  stepTarget: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const days = useMemo(() => {
    const byDate = new Map(daily.map((d) => [d.date, d]));
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (27 - i));
      const key = d.toISOString().slice(0, 10);
      const log = byDate.get(key);
      const steps = typeof log?.steps === "number" ? log.steps : undefined;
      const pct =
        steps !== undefined && stepTarget > 0 ? clampPercent((steps / stepTarget) * 100) : 0;
      const complete = steps !== undefined && stepTarget > 0 && steps >= stepTarget;
      const hasData = steps !== undefined;
      return { key, steps, pct, complete, hasData };
    });
  }, [daily, stepTarget]);

  return (
    <div className="mt-6 border-t border-border pt-5">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Step history
        </div>
        <div className="text-[10px] text-muted-foreground">Last 28 days · tap a day</div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <button
            key={day.key}
            type="button"
            title={
              day.hasData
                ? `${day.key}: ${day.steps?.toLocaleString()} steps`
                : `${day.key}: no data`
            }
            onClick={() => onSelectDate(day.key)}
            className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[9px] transition hover:bg-foreground/[0.03] ${
              selectedDate === day.key ? "border-foreground bg-foreground/[0.04]" : "border-border"
            }`}
          >
            <MiniStepRing pct={day.pct} complete={day.complete} hasData={day.hasData} />
            <span className="text-muted-foreground">{day.key.slice(8)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MiniStepRing({
  pct,
  complete,
  hasData,
}: {
  pct: number;
  complete: boolean;
  hasData: boolean;
}) {
  const r = 10;
  const c = 2 * Math.PI * r;
  const dash = c * (clampPercent(pct) / 100);
  const stroke = !hasData
    ? "var(--muted)"
    : complete
      ? "var(--gold)"
      : "color-mix(in oklab, var(--foreground) 55%, transparent)";
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className="-rotate-90" aria-hidden>
      <circle cx="14" cy="14" r={r} stroke="var(--muted)" strokeWidth="2.5" fill="none" />
      {hasData && (
        <circle
          cx="14"
          cy="14"
          r={r}
          stroke={stroke}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - dash}
        />
      )}
    </svg>
  );
}

function ScoreRow({ label, value, sub }: { label: string; value: number; sub: string }) {
  const width = clampPercent(value);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-sm">{value}%</div>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground/80 transition-[width] duration-300 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function WeightTargetsEditor({
  start,
  current,
  goal,
  onSave,
}: {
  start: number;
  current: number;
  goal: number;
  onSave: (start: number, current: number, goal: number) => void;
}) {
  const [startVal, setStartVal] = useState<number | "">(start);
  const [currentVal, setCurrentVal] = useState<number | "">(current);
  const [goalVal, setGoalVal] = useState<number | "">(goal);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStartVal(start);
    setCurrentVal(current);
    setGoalVal(goal);
  }, [start, current, goal]);

  const valid =
    typeof startVal === "number" &&
    typeof currentVal === "number" &&
    typeof goalVal === "number" &&
    startVal > 0 &&
    currentVal > 0 &&
    goalVal > 0;

  const dirty =
    startVal !== start || currentVal !== current || goalVal !== goal;

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Change your starting weight, current weight or goal. Journey progress and achievements use
        these numbers.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Start (kg)" value={startVal} onChange={setStartVal} placeholder="e.g. 75" />
        <Field
          label="Current (kg)"
          value={currentVal}
          onChange={setCurrentVal}
          placeholder="e.g. 72"
        />
        <Field label="Goal (kg)" value={goalVal} onChange={setGoalVal} placeholder="e.g. 65" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!valid || !dirty}
          onClick={() => {
            onSave(startVal as number, currentVal as number, goalVal as number);
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2000);
          }}
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90 disabled:opacity-40"
        >
          Save weight targets
        </button>
        {saved && <span className="text-xs text-muted-foreground">Saved</span>}
      </div>
    </div>
  );
}

function TargetsEditor({
  targets,
  onChange,
}: {
  targets: FitnessTargets;
  onChange: (p: Partial<FitnessTargets>) => void;
}) {
  const fields: { key: keyof FitnessTargets; label: string; step?: number }[] = [
    { key: "calories", label: "Calories (kcal)", step: 50 },
    { key: "protein", label: "Protein (g)", step: 5 },
    { key: "water", label: "Water (L)", step: 0.25 },
    { key: "steps", label: "Steps", step: 500 },
    { key: "sleep", label: "Sleep (h)", step: 0.25 },
    { key: "walkMinDaily", label: "Walk min/day", step: 5 },
    { key: "gymMinWeekly", label: "Gym min/week", step: 15 },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="text-xs text-muted-foreground">{f.label}</label>
          <input
            type="number"
            min={0}
            step={f.step ?? 1}
            value={targets[f.key]}
            onChange={(e) => onChange({ [f.key]: +e.target.value || 0 } as Partial<FitnessTargets>)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      ))}
    </div>
  );
}

// ============================================
// Setup
// ============================================
function SetupFitness({
  fitness,
  onSave,
}: {
  fitness: { start: number; current: number; goal: number };
  onSave: (start: number, current: number, goal: number) => void;
}) {
  const [start, setStart] = useState<number | "">(fitness.start > 0 ? fitness.start : "");
  const [current, setCurrent] = useState<number | "">(fitness.current > 0 ? fitness.current : "");
  const [goal, setGoal] = useState<number | "">(fitness.goal > 0 ? fitness.goal : "");
  return (
    <div>
      <PageHeader
        eyebrow="Wellbeing"
        title="Fitness"
        subtitle="Set your starting point to begin tracking your journey."
      />
      <Section>
        <div className="max-w-xl rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-muted">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display text-xl">Set your targets</div>
              <div className="text-xs text-muted-foreground">
                Enter your weights in kg. You can change these anytime.
              </div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Start (kg)" value={start} onChange={setStart} placeholder="e.g. 75" />
            <Field
              label="Current (kg)"
              value={current}
              onChange={setCurrent}
              placeholder="e.g. 72"
            />
            <Field label="Goal (kg)" value={goal} onChange={setGoal} placeholder="e.g. 65" />
          </div>
          <button
            disabled={
              !(
                typeof start === "number" &&
                typeof current === "number" &&
                typeof goal === "number" &&
                start > 0 &&
                current > 0 &&
                goal > 0
              )
            }
            onClick={() => onSave(start as number, current as number, goal as number)}
            className="mt-5 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-40"
          >
            Save targets
          </button>
        </div>
      </Section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type="number"
        step="0.1"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? "" : +e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}
