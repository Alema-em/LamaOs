import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ElementType, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useGame, projectProgress } from "@/hooks/use-game";
import { PageHeader, Section, Panel, Stat } from "@/components/ui-kit";
import { Plus, Check, Trash2, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/career")({
  head: () => ({ meta: [{ title: "Career Command Center — LamaOS" }] }),
  component: Career,
});

// Weights for readiness score
const WEIGHTS = {
  dsa: 0.25,
  projects: 0.2,
  experience: 0.2,
  resume: 0.15,
  networking: 0.1,
  technical: 0.1,
};

function Career() {
  const {
    state,
    setCareer,
    addCareerSkill,
    removeCareerSkill,
    addCareerCheck,
    toggleCareerCheck,
    removeCareerCheck,
  } = useGame();
  const c = state.career;

  const dsaCount = state.dsa.problems.length;
  const dsaScore = Math.min(100, (dsaCount / 150) * 100);

  const projAvg = state.projects.length
    ? state.projects.reduce((a, p) => a + projectProgress(p), 0) / state.projects.length
    : 0;
  const projectsScore = Math.min(100, projAvg * (state.projects.length >= 2 ? 1 : 0.7));

  const apps = state.internships.applications;
  const offers = apps.filter((a) => a.status === "offer").length;
  const interviews = apps.filter((a) => a.status === "interview").length;
  const experienceScore = offers > 0 ? 100 : Math.min(90, apps.length * 6 + interviews * 12);

  const resumeScore = Math.min(100, c.resumeUpdates * 20 + (c.linkedinScore + c.githubScore) / 2);
  const networkingScore = Math.min(100, c.networkingContacts * 5);
  const technicalScore = Math.min(
    100,
    c.technicalScore +
      (c.skills.length
        ? (c.skills.reduce((a, s) => a + s.level, 0) / (c.skills.length * 5)) * 50
        : 0),
  );

  const readiness = Math.round(
    dsaScore * WEIGHTS.dsa +
      projectsScore * WEIGHTS.projects +
      experienceScore * WEIGHTS.experience +
      resumeScore * WEIGHTS.resume +
      networkingScore * WEIGHTS.networking +
      technicalScore * WEIGHTS.technical,
  );

  const recs = buildCareerRecs(
    { dsaScore, projectsScore, experienceScore, resumeScore, networkingScore, technicalScore },
    state,
  );

  return (
    <div>
      <PageHeader
        eyebrow="Career"
        title="Career Command Center"
        subtitle="The systems behind the offer. Every dial that matters, in one place."
      />

      <Section className="grid grid-cols-2 gap-x-10 gap-y-8 border-b border-border md:grid-cols-4">
        <Stat label="Readiness" value={`${readiness}%`} accent />
        <Stat label="DSA solved" value={dsaCount} sub="Target 150" />
        <Stat
          label="Applications"
          value={apps.length}
          sub={`${interviews} interviews · ${offers} offers`}
        />
        <Stat label="Skills" value={c.skills.length} sub="Tracked" />
      </Section>

      <Section className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Readiness breakdown" hint="Weighted">
          <div className="space-y-5">
            <ScoreRow label="DSA mastery" pct={dsaScore} weight={WEIGHTS.dsa} to="/dsa" />
            <ScoreRow
              label="Projects"
              pct={projectsScore}
              weight={WEIGHTS.projects}
              to="/projects"
            />
            <ScoreRow
              label="Experience"
              pct={experienceScore}
              weight={WEIGHTS.experience}
              to="/internships"
            />
            <ScoreRow label="Resume / Profile" pct={resumeScore} weight={WEIGHTS.resume} />
            <ScoreRow label="Networking" pct={networkingScore} weight={WEIGHTS.networking} />
            <ScoreRow label="Technical depth" pct={technicalScore} weight={WEIGHTS.technical} />
          </div>
        </Panel>

        <Panel title="Recommendations" hint="Top 3">
          <ul className="space-y-3">
            {recs.map((r, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border bg-background/40 px-3 py-3"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div className="text-sm">{r}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <Section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Profile signals" hint="0–100 scores you set">
          <div className="space-y-4">
            <NumField
              label="Resume updates this month"
              value={c.resumeUpdates}
              onChange={(v) => setCareer({ resumeUpdates: v })}
              max={20}
            />
            <NumField
              label="LinkedIn score"
              value={c.linkedinScore}
              onChange={(v) => setCareer({ linkedinScore: v })}
              max={100}
            />
            <NumField
              label="GitHub score"
              value={c.githubScore}
              onChange={(v) => setCareer({ githubScore: v })}
              max={100}
            />
            <NumField
              label="Networking contacts"
              value={c.networkingContacts}
              onChange={(v) => setCareer({ networkingContacts: v })}
              max={200}
            />
            <NumField
              label="Interview prep hours"
              value={c.interviewPrepHours}
              onChange={(v) => setCareer({ interviewPrepHours: v })}
              max={500}
            />
            <NumField
              label="Technical confidence (base)"
              value={c.technicalScore}
              onChange={(v) => setCareer({ technicalScore: v })}
              max={50}
            />
          </div>
        </Panel>

        <Panel title="Skills" hint={`${c.skills.length}`}>
          <NewSkillForm onAdd={addCareerSkill} />
          <ul className="mt-3 space-y-2 max-h-72 overflow-y-auto">
            {c.skills.map((s) => (
              <li
                key={s.id}
                className="group flex items-center gap-3 rounded-lg border border-border px-3 py-2"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="mt-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`h-1.5 w-6 rounded-full ${n <= s.level ? "bg-foreground/70" : "bg-muted"}`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => removeCareerSkill(s.id)}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </li>
            ))}
            {c.skills.length === 0 && (
              <li className="text-sm text-muted-foreground">
                No skills tracked yet. Add your top technical strengths.
              </li>
            )}
          </ul>
        </Panel>
      </Section>

      <Section className="pb-16">
        <Panel
          title="Career checklist"
          hint={`${c.checklist.filter((x) => x.done).length}/${c.checklist.length}`}
        >
          <NewCheckForm onAdd={addCareerCheck} />
          <ul className="mt-3 space-y-2">
            {c.checklist.map((item) => (
              <li
                key={item.id}
                className="group flex items-center gap-3 rounded-lg border border-border px-3 py-2"
              >
                <button
                  onClick={() => toggleCareerCheck(item.id)}
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${item.done ? "border-foreground bg-foreground text-background" : "border-border"}`}
                >
                  {item.done && <Check className="h-3 w-3" />}
                </button>
                <span
                  className={`flex-1 text-sm ${item.done ? "line-through text-muted-foreground" : ""}`}
                >
                  {item.text}
                </span>
                <button
                  onClick={() => removeCareerCheck(item.id)}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </li>
            ))}
            {c.checklist.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Add items like "Update resume", "Reach out to 3 founders this week", "Build
                portfolio site".
              </li>
            )}
          </ul>
        </Panel>
      </Section>
    </div>
  );
}

function buildCareerRecs(
  scores: {
    dsaScore: number;
    projectsScore: number;
    experienceScore: number;
    resumeScore: number;
    networkingScore: number;
    technicalScore: number;
  },
  state: ReturnType<typeof useGame>["state"],
) {
  const recs: string[] = [];
  const ranked = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  const lowest = ranked[0][0];
  if (lowest === "dsaScore")
    recs.push(
      `DSA is your weakest signal — aim for 5 problems this week. Currently ${state.dsa.problems.length}/150.`,
    );
  if (lowest === "projectsScore")
    recs.push("Ship a small visible project. Even a 2-week scoped tool moves the needle.");
  if (lowest === "experienceScore")
    recs.push(
      "Apply to 5 more roles this week. Focus on startups where founders read every application.",
    );
  if (lowest === "resumeScore")
    recs.push("Refresh resume + LinkedIn this week. Quantify two recent impact statements.");
  if (lowest === "networkingScore")
    recs.push("Reach out to 3 engineers at companies you admire. Coffee, not asks.");
  if (lowest === "technicalScore")
    recs.push("Pick one technology to go deep on for a month. Document the journey publicly.");

  if (scores.dsaScore < 50) recs.push("Improve DSA consistency — 30 minutes daily compounds fast.");
  if (state.projects.length < 2) recs.push("Have at least 2 active projects to show range.");
  if (state.career.checklist.filter((c) => !c.done).length > 0) {
    recs.push(
      `You have ${state.career.checklist.filter((c) => !c.done).length} open items in your career checklist.`,
    );
  }
  return Array.from(new Set(recs)).slice(0, 3);
}

function ScoreRow({
  label,
  pct,
  weight,
  to,
}: {
  label: string;
  pct: number;
  weight: number;
  to?: string;
}) {
  const Comp: ElementType<{ to?: string; className?: string; children?: ReactNode }> = to
    ? Link
    : "div";
  return (
    <Comp to={to} className="block group">
      <div className="mb-2 flex items-baseline justify-between">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">
          {Math.round(pct)}% · {Math.round(weight * 100)}% weight
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9 }}
          className="h-full rounded-full bg-foreground/80 group-hover:bg-accent"
        />
      </div>
    </Comp>
  );
}

function NumField({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(0, +e.target.value || 0))}
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}

function NewSkillForm({ onAdd }: { onAdd: (name: string, level: number) => void }) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState(3);
  return (
    <div className="grid gap-2 md:grid-cols-[1fr,120px,auto]">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Skill (e.g. React)"
        maxLength={40}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <select
        value={level}
        onChange={(e) => setLevel(+e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            Level {n}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          if (name.trim()) {
            onAdd(name.trim(), level);
            setName("");
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm text-background hover:opacity-90"
      >
        <Plus className="h-3.5 w-3.5" /> Add
      </button>
    </div>
  );
}

function NewCheckForm({ onAdd }: { onAdd: (text: string) => void }) {
  const [t, setT] = useState("");
  return (
    <div className="flex gap-2">
      <input
        value={t}
        onChange={(e) => setT(e.target.value)}
        placeholder="Add a checklist item"
        maxLength={120}
        className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <button
        onClick={() => {
          if (t.trim()) {
            onAdd(t.trim());
            setT("");
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
      >
        <Plus className="h-3.5 w-3.5" /> Add
      </button>
    </div>
  );
}
