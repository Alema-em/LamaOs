import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useMemo, type ElementType, type ReactNode } from "react";
import { useGame, goalProgress, projectProgress, dailyScore } from "@/hooks/use-game";
import { DSA_TOPICS } from "@/lib/dsa-topics";
import { Mochi } from "@/components/Mochi";
import { clampPercent, weightJourneyPercent } from "@/lib/progress";
import { Panel, Section, Stat } from "@/components/ui-kit";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  ArrowUpRight,
  Flame,
  Trophy,
  Target,
  Plus,
  Pin,
  Sparkles,
  Calendar,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LamaOS — Home" },
      { name: "description", content: "Your personal command center." },
    ],
  }),
  component: Home,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Home() {
  const {
    state,
    hydrated,
    xpForLevel,
    setProfile,
    setFitnessTargets,
    setDsaGoal,
    createProject,
    logWeight,
    logProblem,
    addApplication,
  } = useGame();

  const needed = xpForLevel(state.level);
  const xpPct = clampPercent((state.xp / needed) * 100);

  const dsaPct =
    state.dsa.goal > 0 ? clampPercent((state.dsa.problems.length / state.dsa.goal) * 100) : 0;
  const weightProgress = weightJourneyPercent(
    state.fitness.start,
    state.fitness.current,
    state.fitness.goal,
  );
  const activeGoals = state.goals.filter((g) => !g.archived);
  const goalAvg = activeGoals.length
    ? activeGoals.reduce((a, g) => a + goalProgress(g), 0) / activeGoals.length
    : 0;
  const projAvg = state.projects.length
    ? state.projects.reduce((a, p) => a + projectProgress(p), 0) / state.projects.length
    : 0;
  const journey =
    dsaPct * 0.25 +
    weightProgress * 0.2 +
    projAvg * 0.2 +
    goalAvg * 0.25 +
    Math.min(100, state.level * 8) * 0.1;

  const weightSeries = state.fitness.history.map((h) => ({
    date: h.date.slice(5),
    weight: h.weight,
  }));
  const pinnedGoals = activeGoals.filter((g) => g.pinned);
  const pinnedProjects = state.projects.filter((p) => p.pinned && p.status !== "archived");
  const prefs = state.prefs;

  const todayLog = state.fitness.daily.find(
    (d) => d.date === new Date().toISOString().slice(0, 10),
  );
  const todayScore = dailyScore(todayLog, state.fitness.targets);

  // Smart Today
  const today = useMemo(() => buildToday(state), [state]);

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border px-6 pb-10 pt-10 md:px-12 md:pt-16 md:pb-12">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-1 w-1 rounded-full bg-accent" />
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>
            <h1 className="font-display text-4xl leading-[1.05] md:text-6xl">
              {greeting()}, <span className="italic">{state.name || "friend"}.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground">
              {state.focus ||
                (state.mainGoal ? state.mainGoal : "Open today with one small, honest step.")}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card/70 px-5 py-4 shadow-soft backdrop-blur"
          >
            <Mochi size={56} mood={state.streak >= 7 ? "happy" : "calm"} />
            <div>
              <div className="text-xs text-muted-foreground">Mochi says</div>
              <div className="font-display text-lg italic">
                {state.streak === 0
                  ? "A clean page. Beautiful."
                  : state.streak >= 7
                    ? `${state.streak} days strong.`
                    : "One thoughtful step today."}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Onboarding inline card (non-blocking — sidebar always visible) */}
      {hydrated && !state.onboarded && (
        <Section>
          <InlineOnboarding
            onComplete={(data) => {
              setProfile({
                name: data.name,
                mainGoal: data.careerGoal,
                focus: "Begin where you are.",
                onboarded: true,
              });
              if (data.startWeight && data.targetWeight) {
                setFitnessTargets(data.startWeight, data.startWeight, data.targetWeight);
              }
              if (data.dsaGoal > 0) setDsaGoal(data.dsaGoal);
              data.projects.forEach((name) =>
                createProject({ name, status: "active", priority: "med" }),
              );
            }}
          />
        </Section>
      )}

      {/* Stat strip */}
      <Section className="grid grid-cols-2 gap-x-10 gap-y-8 border-b border-border md:grid-cols-4">
        <Stat
          label="Streak"
          value={
            <span className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-accent" />
              {state.streak}d
            </span>
          }
          sub="Show up daily"
        />
        <Stat label="Level" value={state.level} sub={`${state.xp} / ${needed} XP`} />
        <Stat label="Today's score" value={`${todayScore}%`} sub="Daily habits" />
        <Stat
          label="Main goal"
          value={
            <span className="text-lg leading-snug md:text-xl">
              {state.mainGoal || "Define your north star"}
            </span>
          }
          sub={
            state.mainGoal ? (
              "North star"
            ) : (
              <Link to="/settings" className="underline">
                Set it
              </Link>
            )
          }
        />
      </Section>

      {/* Smart Today */}
      {prefs.showToday !== false && (
        <Section className="border-b border-border">
          <SmartToday today={today} score={todayScore} />
        </Section>
      )}

      {/* Quick add */}
      <Section className="border-b border-border">
        <QuickAdd
          onWeight={(w) => logWeight(w)}
          onProblem={(t, topic, diff) => logProblem({ title: t, topic, difficulty: diff })}
          onApp={(c, r) => addApplication({ company: c, role: r, status: "applied" })}
        />
      </Section>

      {/* Pinned goals + projects */}
      {prefs.showPinnedGoals &&
        (pinnedGoals.length + pinnedProjects.length > 0 || activeGoals.length === 0) && (
          <Section>
            <div className="mb-5 flex items-baseline justify-between">
              <h3 className="font-display text-2xl">Pinned</h3>
              <Link to="/goals" className="text-xs text-muted-foreground hover:text-foreground">
                All goals →
              </Link>
            </div>
            {pinnedGoals.length === 0 && pinnedProjects.length === 0 ? (
              <EmptyCard
                icon={<Pin className="h-4 w-4" />}
                title="Nothing pinned yet"
                body="Pin a goal or project to keep it front and centre every time you open LamaOS."
                actionLabel="Create a goal"
                to="/goals"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pinnedGoals.map((g) => {
                  const pct = goalProgress(g);
                  return (
                    <Link
                      key={g.id}
                      to="/goals"
                      className="group rounded-2xl border border-border bg-card p-5 transition hover:bg-foreground/[0.03]"
                    >
                      <div className="flex items-baseline justify-between">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          {g.category}
                        </div>
                        {g.targetDate && (
                          <div className="text-[10px] text-muted-foreground">by {g.targetDate}</div>
                        )}
                      </div>
                      <div className="mt-2 font-display text-xl leading-snug">{g.title}</div>
                      {g.description && (
                        <div className="mt-1 text-xs text-muted-foreground">{g.description}</div>
                      )}
                      <ProgressBar pct={pct} />
                      <div className="mt-2 text-[11px] text-muted-foreground">
                        {Math.round(pct)}% · {g.milestones.filter((m) => m.done).length}/
                        {g.milestones.length} milestones
                      </div>
                    </Link>
                  );
                })}
                {pinnedProjects.map((p) => {
                  const pct = projectProgress(p);
                  return (
                    <Link
                      key={p.id}
                      to="/projects"
                      className="group rounded-2xl border border-border bg-card p-5 transition hover:bg-foreground/[0.03]"
                    >
                      <div className="flex items-baseline justify-between">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          Project · {p.status}
                        </div>
                        {p.deadline && (
                          <div className="text-[10px] text-muted-foreground">by {p.deadline}</div>
                        )}
                      </div>
                      <div className="mt-2 font-display text-xl leading-snug">{p.name}</div>
                      {p.description && (
                        <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {p.description}
                        </div>
                      )}
                      <ProgressBar pct={pct} />
                      <div className="mt-2 text-[11px] text-muted-foreground">
                        {Math.round(pct)}% · {p.tasks.filter((t) => t.done).length}/{p.tasks.length}{" "}
                        tasks
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Section>
        )}

      {/* Journey ring + breakdown */}
      {prefs.showJourney && (
        <Section>
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel className="lg:col-span-1" title="The Journey" hint="Composite">
              <div className="flex flex-col items-center py-2">
                <Ring value={journey} />
                <div className="mt-6 text-center">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Toward your future
                  </div>
                  <div className="mt-1 font-display text-2xl">{Math.round(journey)}%</div>
                </div>
              </div>
            </Panel>

            <Panel className="lg:col-span-2" title="Progress breakdown" hint="Live">
              <div className="space-y-6">
                <ProgressRow
                  label="DSA mastery"
                  value={dsaPct}
                  sub={
                    state.dsa.goal > 0
                      ? `${state.dsa.problems.length} / ${state.dsa.goal} problems`
                      : "Set a goal"
                  }
                  to="/dsa"
                />
                <ProgressRow
                  label="Fitness"
                  value={weightProgress}
                  sub={
                    state.fitness.start
                      ? `${state.fitness.current}kg → ${state.fitness.goal}kg`
                      : "Set targets"
                  }
                  to="/fitness"
                />
                <ProgressRow
                  label="Projects"
                  value={projAvg}
                  sub={state.projects.length ? `${state.projects.length} active` : "Start one"}
                  to="/projects"
                />
                <ProgressRow
                  label="Goals"
                  value={goalAvg}
                  sub={`${activeGoals.length} active`}
                  to="/goals"
                />
                <ProgressRow label="XP" value={xpPct} sub={`Level ${state.level}`} />
              </div>
            </Panel>
          </div>
        </Section>
      )}

      {/* Weight chart + recent achievements */}
      {(prefs.showWeightTrend || prefs.showAchievements) && (
        <Section className="grid gap-6 lg:grid-cols-3">
          {prefs.showWeightTrend && (
            <Panel
              className="lg:col-span-2"
              title="Weight trend"
              hint={weightSeries.length ? `${weightSeries.length} entries` : "Empty"}
            >
              {weightSeries.length === 0 ? (
                <EmptyInline body="Log your first weight from the quick-add bar above to begin your trend." />
              ) : (
                <div className="h-56 -ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightSeries}>
                      <defs>
                        <linearGradient id="wf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.5} />
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
                        domain={["dataMin - 1", "dataMax + 1"]}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                        width={32}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "var(--muted-foreground)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="var(--gold)"
                        strokeWidth={2.5}
                        fill="url(#wf)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>
          )}

          {prefs.showAchievements && (
            <Panel title="Recent unlocks" hint={`${state.achievements.length}`}>
              <ul className="space-y-3">
                {state.achievements.slice(0, 5).map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-3 rounded-lg border border-border px-3 py-3"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-accent/20 text-accent-foreground">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-medium">{a.replace(/-/g, " ")}</div>
                  </li>
                ))}
                {state.achievements.length === 0 && (
                  <li className="text-sm text-muted-foreground">
                    Your first unlock awaits the first real action.
                  </li>
                )}
                <Link
                  to="/achievements"
                  className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  See all <ArrowUpRight className="h-3 w-3" />
                </Link>
              </ul>
            </Panel>
          )}
        </Section>
      )}

      {/* Quick areas */}
      {prefs.showWorkspaces && (
        <Section className="pb-16">
          <div className="mb-5 flex items-baseline justify-between">
            <h3 className="font-display text-2xl">Your workspaces</h3>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AreaCard to="/mission" title="Mission" caption="Summer 2026" />
            <AreaCard to="/dsa" title="DSA" caption={`${state.dsa.problems.length} solved`} />
            <AreaCard
              to="/internships"
              title="Internships"
              caption={`${state.internships.applications.length} live`}
            />
            <AreaCard to="/projects" title="Projects" caption={`${state.projects.length} active`} />
          </div>
        </Section>
      )}
    </div>
  );
}

// ============================================
// Smart Today
// ============================================
function buildToday(state: ReturnType<typeof useGame>["state"]) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const in7 = new Date();
  in7.setDate(in7.getDate() + 7);
  const in7Key = in7.toISOString().slice(0, 10);

  // Approaching deadlines (goals, project tasks, project deadlines)
  const upcoming: { kind: string; title: string; due: string; to: string; overdue: boolean }[] = [];
  state.goals
    .filter((g) => !g.archived && g.targetDate)
    .forEach((g) => {
      if (g.targetDate! <= in7Key)
        upcoming.push({
          kind: "Goal",
          title: g.title,
          due: g.targetDate!,
          to: "/goals",
          overdue: g.targetDate! < todayKey,
        });
    });
  state.projects
    .filter((p) => p.status !== "archived" && p.deadline)
    .forEach((p) => {
      if (p.deadline! <= in7Key)
        upcoming.push({
          kind: "Project",
          title: p.name,
          due: p.deadline!,
          to: "/projects",
          overdue: p.deadline! < todayKey,
        });
    });
  state.projects.forEach((p) => {
    p.tasks
      .filter((t) => !t.done && t.due && t.due <= in7Key)
      .forEach((t) => {
        upcoming.push({
          kind: p.name,
          title: t.title,
          due: t.due!,
          to: "/projects",
          overdue: t.due! < todayKey,
        });
      });
  });
  upcoming.sort((a, b) => a.due.localeCompare(b.due));

  // Top priorities (pinned goals + high-priority unfinished project tasks)
  const top: { title: string; sub: string; to: string }[] = [];
  state.goals
    .filter((g) => g.pinned && !g.archived)
    .slice(0, 3)
    .forEach((g) =>
      top.push({ title: g.title, sub: `Goal · ${Math.round(goalProgress(g))}%`, to: "/goals" }),
    );
  state.projects
    .flatMap((p) => p.tasks.filter((t) => !t.done && t.priority === "high").map((t) => ({ p, t })))
    .slice(0, 3)
    .forEach(({ p, t }) =>
      top.push({ title: t.title, sub: `${p.name} · high priority`, to: "/projects" }),
    );

  // Suggested focus area: pick lowest-progress active area
  const dsaPct =
    state.dsa.goal > 0 ? clampPercent((state.dsa.problems.length / state.dsa.goal) * 100) : 100;
  const projAvg = state.projects.length
    ? state.projects.reduce((a, p) => a + projectProgress(p), 0) / state.projects.length
    : 100;
  const wp = weightJourneyPercent(state.fitness.start, state.fitness.current, state.fitness.goal);
  const choices: { name: string; pct: number; to: string }[] = [
    { name: "DSA practice", pct: dsaPct, to: "/dsa" },
    { name: "Project momentum", pct: projAvg, to: "/projects" },
    { name: "Fitness progress", pct: wp, to: "/fitness" },
  ];
  const focus = choices.sort((a, b) => a.pct - b.pct)[0];

  return { upcoming, top, focus };
}

function SmartToday({ today, score }: { today: ReturnType<typeof buildToday>; score: number }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Panel
        className="lg:col-span-1"
        title="Today"
        hint={new Date().toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
      >
        <div className="space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Suggested focus
            </div>
            <Link
              to={today.focus.to}
              className="mt-1 inline-flex items-center gap-2 font-display text-xl hover:text-accent"
            >
              <Sparkles className="h-4 w-4" /> {today.focus.name}
            </Link>
            <div className="mt-1 text-xs text-muted-foreground">
              Currently at {Math.round(today.focus.pct)}%.
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Daily habits
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/80 transition-[width] duration-300 ease-out"
                style={{ width: `${clampPercent(score)}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {score}% of today's targets ·{" "}
              <Link to="/fitness" className="underline">
                log
              </Link>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="lg:col-span-1" title="Top priorities" hint="Pinned & high">
        {today.top.length === 0 ? (
          <EmptyInline body="No priorities yet. Pin goals or add high-priority tasks to projects." />
        ) : (
          <ul className="space-y-3">
            {today.top.map((t, i) => (
              <li key={i}>
                <Link
                  to={t.to}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-3 hover:bg-foreground/[0.03]"
                >
                  <div>
                    <div className="text-sm font-medium">{t.title}</div>
                    <div className="text-[11px] text-muted-foreground">{t.sub}</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel className="lg:col-span-1" title="On the horizon" hint="Next 7 days">
        {today.upcoming.length === 0 ? (
          <EmptyInline body="Nothing due in the next week." />
        ) : (
          <ul className="space-y-2">
            {today.upcoming.slice(0, 6).map((d, i) => (
              <li key={i}>
                <Link
                  to={d.to}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${d.overdue ? "border-destructive/40 bg-destructive/5" : "border-border"}`}
                >
                  <span className="flex items-center gap-2">
                    {d.overdue ? (
                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    ) : (
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="font-medium">{d.title}</span>
                    <span className="text-muted-foreground">· {d.kind}</span>
                  </span>
                  <span className={d.overdue ? "text-destructive" : "text-muted-foreground"}>
                    {d.due}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

// ============================================
// Inline Onboarding (does not hide nav)
// ============================================
interface OnboardingData {
  name: string;
  careerGoal: string;
  startWeight: number | null;
  targetWeight: number | null;
  dsaGoal: number;
  projects: string[];
}
function InlineOnboarding({ onComplete }: { onComplete: (data: OnboardingData) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [startWeight, setStartWeight] = useState<number | "">("");
  const [targetWeight, setTargetWeight] = useState<number | "">("");
  const [dsaGoal, setDsaGoal] = useState<number | "">("");
  const [projectsText, setProjectsText] = useState("");

  const steps = [
    {
      title: "What should we call you?",
      desc: "Just a name. Mochi will say hi.",
      valid: name.trim().length > 0,
      field: (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder="Your name"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      ),
    },
    {
      title: "Your career goal?",
      desc: "Your north star for the next year or two.",
      valid: true,
      field: (
        <input
          value={careerGoal}
          onChange={(e) => setCareerGoal(e.target.value)}
          maxLength={140}
          placeholder="e.g. Land a SWE internship at a top firm"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      ),
    },
    {
      title: "Fitness target?",
      desc: "Optional. Set your starting and target weight in kg.",
      valid: true,
      field: (
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            step="0.1"
            value={startWeight}
            onChange={(e) => setStartWeight(e.target.value === "" ? "" : +e.target.value)}
            placeholder="Start (kg)"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            type="number"
            step="0.1"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value === "" ? "" : +e.target.value)}
            placeholder="Target (kg)"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      ),
    },
    {
      title: "Summer DSA goal?",
      desc: "How many problems do you want to solve?",
      valid: true,
      field: (
        <input
          type="number"
          min={0}
          value={dsaGoal}
          onChange={(e) => setDsaGoal(e.target.value === "" ? "" : +e.target.value)}
          placeholder="e.g. 150"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      ),
    },
    {
      title: "Primary projects?",
      desc: "Comma-separated. You can add more later.",
      valid: true,
      field: (
        <input
          value={projectsText}
          onChange={(e) => setProjectsText(e.target.value)}
          placeholder="e.g. BrandForge, LamaOS, Axiomera"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      ),
    },
  ];

  const cur = steps[step];
  const isLast = step === steps.length - 1;

  function finish() {
    onComplete({
      name: name.trim() || "Friend",
      careerGoal: careerGoal.trim(),
      startWeight: typeof startWeight === "number" && startWeight > 0 ? startWeight : null,
      targetWeight: typeof targetWeight === "number" && targetWeight > 0 ? targetWeight : null,
      dsaGoal: typeof dsaGoal === "number" && dsaGoal > 0 ? dsaGoal : 0,
      projects: projectsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12),
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8"
    >
      <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Welcome · Step {step + 1} of {steps.length}
      </div>
      <h2 className="mt-2 font-display text-3xl leading-tight md:text-4xl">{cur.title}</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{cur.desc}</p>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full bg-foreground/80"
          initial={false}
          animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="mt-6 max-w-xl">{cur.field}</div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Back
          </button>
        )}
        {!isLast ? (
          <button
            disabled={!cur.valid}
            onClick={() => setStep((s) => s + 1)}
            className="rounded-md bg-foreground px-5 py-2 text-sm text-background hover:opacity-90 disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <button
            disabled={!name.trim()}
            onClick={finish}
            className="rounded-md bg-foreground px-5 py-2 text-sm text-background hover:opacity-90 disabled:opacity-40"
          >
            Enter LamaOS
          </button>
        )}
        <button
          onClick={() =>
            onComplete({
              name: name.trim() || "Friend",
              careerGoal: careerGoal.trim(),
              startWeight: null,
              targetWeight: null,
              dsaGoal: 0,
              projects: [],
            })
          }
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Skip setup
        </button>
      </div>
    </motion.div>
  );
}

function QuickAdd({
  onWeight,
  onProblem,
  onApp,
}: {
  onWeight: (w: number) => void;
  onProblem: (t: string, topic: string, d: "easy" | "medium" | "hard") => void;
  onApp: (c: string, r: string) => void;
}) {
  const [mode, setMode] = useState<null | "weight" | "dsa" | "app">(null);
  const [weight, setWeight] = useState<number | "">("");
  const [pTitle, setPTitle] = useState("");
  const [pTopic, setPTopic] = useState("Arrays");
  const [pDiff, setPDiff] = useState<"easy" | "medium" | "hard">("medium");
  const [c, setC] = useState("");
  const [r, setR] = useState("");

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Quick add
          </div>
          <div className="mt-1 font-display text-lg">Log something honest from today</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill
            active={mode === "weight"}
            onClick={() => setMode(mode === "weight" ? null : "weight")}
          >
            Weight
          </Pill>
          <Pill active={mode === "dsa"} onClick={() => setMode(mode === "dsa" ? null : "dsa")}>
            DSA problem
          </Pill>
          <Pill active={mode === "app"} onClick={() => setMode(mode === "app" ? null : "app")}>
            Application
          </Pill>
        </div>
      </div>

      {mode === "weight" && (
        <div className="mt-5 flex flex-wrap gap-2">
          <input
            type="number"
            step="0.1"
            placeholder="kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value === "" ? "" : +e.target.value)}
            className="w-32 rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              if (typeof weight === "number" && weight > 0) {
                onWeight(weight);
                setWeight("");
                setMode(null);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Log
          </button>
        </div>
      )}
      {mode === "dsa" && (
        <div className="mt-5 grid gap-2 md:grid-cols-[1fr,160px,160px,auto]">
          <input
            placeholder="Problem title"
            value={pTitle}
            onChange={(e) => setPTitle(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            value={pTopic}
            onChange={(e) => setPTopic(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {DSA_TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select
            value={pDiff}
            onChange={(e) => setPDiff(e.target.value as "easy" | "medium" | "hard")}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button
            onClick={() => {
              if (pTitle.trim()) {
                onProblem(pTitle.trim(), pTopic, pDiff);
                setPTitle("");
                setMode(null);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Log
          </button>
        </div>
      )}
      {mode === "app" && (
        <div className="mt-5 grid gap-2 md:grid-cols-[1fr,1fr,auto]">
          <input
            placeholder="Company"
            value={c}
            onChange={(e) => setC(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            placeholder="Role"
            value={r}
            onChange={(e) => setR(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              if (c.trim() && r.trim()) {
                onApp(c.trim(), r.trim());
                setC("");
                setR("");
                setMode(null);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Log
          </button>
        </div>
      )}
    </div>
  );
}

function Pill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs transition ${active ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}

function EmptyCard({
  icon,
  title,
  body,
  actionLabel,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  actionLabel: string;
  to: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-8">
      <div className="grid h-9 w-9 place-items-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="font-display text-xl">{title}</div>
      <p className="max-w-md text-sm text-muted-foreground">{body}</p>
      <Link
        to={to}
        className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
      >
        <Plus className="h-4 w-4" /> {actionLabel}
      </Link>
    </div>
  );
}

function EmptyInline({ body }: { body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
      {body}
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  const width = clampPercent(pct);
  return (
    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-foreground/80 transition-[width] duration-300 ease-out group-hover:bg-accent"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function ProgressRow({
  label,
  value,
  sub,
  to,
}: {
  label: string;
  value: number;
  sub?: React.ReactNode;
  to?: string;
}) {
  const Comp: ElementType<{ to?: string; className?: string; children?: ReactNode }> = to
    ? Link
    : "div";
  const width = clampPercent(value);
  return (
    <Comp to={to} className={`block ${to ? "group" : ""}`}>
      <div className="mb-2 flex items-baseline justify-between">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground/80 transition-[width] duration-300 ease-out group-hover:bg-accent"
          style={{ width: `${width}%` }}
        />
      </div>
    </Comp>
  );
}

function Ring({ value }: { value: number }) {
  const r = 70,
    c = 2 * Math.PI * r;
  const dash = c * (clampPercent(value) / 100);
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
      <circle cx="90" cy="90" r={r} stroke="var(--muted)" strokeWidth="6" fill="none" />
      <motion.circle
        cx="90"
        cy="90"
        r={r}
        stroke="var(--gold)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - dash }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

function AreaCard({ to, title, caption }: { to: string; title: string; caption: string }) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition hover:bg-foreground/[0.03]"
    >
      <div className="font-display text-2xl">{title}</div>
      <div className="mt-2 text-xs text-muted-foreground">{caption}</div>
      <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
