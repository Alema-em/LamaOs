import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type ElementType, type ReactNode } from "react";
import { useGame } from "@/hooks/use-game";
import { PageHeader, Section, Panel, Stat } from "@/components/ui-kit";
import { clampPercent } from "@/lib/progress";
import {
  buildCareerActions,
  CAREER_BUCKETS,
  computeCareerMetrics,
  SKILL_CATEGORIES,
  type CareerSkillCategory,
} from "@/lib/career";
import type { CareerPresence } from "@/hooks/use-game";
import { ArrowRight, Check, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/career")({
  head: () => ({ meta: [{ title: "Career — LamaOS" }] }),
  component: Career,
});

const PRESENCE_ITEMS: { key: keyof CareerPresence; label: string; hint: string }[] = [
  { key: "resumeFresh", label: "Resume updated this month", hint: "Tailored bullets, recent wins" },
  { key: "linkedinUpdated", label: "LinkedIn polished", hint: "Headline + featured section" },
  { key: "githubActive", label: "GitHub active", hint: "Pinned repos or recent commits" },
  { key: "portfolioLive", label: "Portfolio / site live", hint: "Link you send recruiters" },
];

function Career() {
  const {
    state,
    setCareer,
    setCareerPresence,
    addCareerSkill,
    removeCareerSkill,
    addCareerCheck,
    toggleCareerCheck,
    removeCareerCheck,
  } = useGame();

  const metrics = useMemo(() => computeCareerMetrics(state), [state]);
  const actions = useMemo(() => buildCareerActions(state, metrics), [state, metrics]);
  const c = state.career;

  const skillsByCategory = useMemo(() => {
    const groups = new Map<string, typeof c.skills>();
    for (const cat of SKILL_CATEGORIES) {
      const items = c.skills.filter((s) => (s.category || "other") === cat.id);
      if (items.length) groups.set(cat.id, items);
    }
    return groups;
  }, [c.skills]);

  return (
    <div>
      <PageHeader
        eyebrow="Career"
        title="Career Command Center"
        subtitle="Craft, pipeline and presence — pulled from what you already log in LamaOS."
      />

      <Section className="grid grid-cols-2 gap-x-10 gap-y-8 border-b border-border md:grid-cols-4">
        <Stat label="Readiness" value={`${metrics.readiness}%`} accent />
        <Stat
          label="Craft"
          value={`${metrics.craft}%`}
          sub={`${metrics.dsaCount} DSA · ${metrics.projectCount} projects`}
        />
        <Stat
          label="Pipeline"
          value={`${metrics.pipeline}%`}
          sub={`${metrics.apps} apps · ${metrics.interviews} interviews`}
        />
        <Stat label="Presence" value={`${metrics.presence}%`} sub={`${c.skills.length} skills`} />
      </Section>

      <Section className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Signal breakdown" hint="Live from your modules">
          <div className="space-y-5">
            <BucketRow
              label="Craft"
              desc="DSA + projects"
              pct={metrics.craft}
              weight={CAREER_BUCKETS.craft}
              to="/dsa"
            />
            <BucketRow
              label="Pipeline"
              desc="Applications & interviews"
              pct={metrics.pipeline}
              weight={CAREER_BUCKETS.pipeline}
              to="/internships"
            />
            <BucketRow
              label="Presence"
              desc="Profile checklist + skills"
              pct={metrics.presence}
              weight={CAREER_BUCKETS.presence}
            />
            <BucketRow
              label="Network"
              desc="Contacts & prep hours"
              pct={metrics.network}
              weight={CAREER_BUCKETS.network}
            />
          </div>
        </Panel>

        <Panel title="Do this next" hint={`${actions.length} moves`}>
          <ul className="space-y-3">
            {actions.map((a, i) => (
              <li key={i}>
                <ActionCard action={a} />
              </li>
            ))}
            {actions.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Strong signals across the board. Keep shipping.
              </li>
            )}
          </ul>
        </Panel>
      </Section>

      <Section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Presence checklist" hint="Toggle when done">
          <p className="mb-4 text-sm text-muted-foreground">
            No more arbitrary 0–100 scores. Check off what&apos;s actually true right now.
          </p>
          <ul className="space-y-2">
            {PRESENCE_ITEMS.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() =>
                    setCareerPresence({ [item.key]: !c.presence[item.key] } as Partial<CareerPresence>)
                  }
                  className="flex w-full items-start gap-3 rounded-lg border border-border px-3 py-3 text-left transition hover:bg-foreground/[0.03]"
                >
                  <span
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border ${c.presence[item.key] ? "border-foreground bg-foreground text-background" : "border-border"}`}
                  >
                    {c.presence[item.key] && <Check className="h-3 w-3" />}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{item.hint}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
            <MiniCounter
              label="Networking contacts"
              value={c.networkingContacts}
              onChange={(v) => setCareer({ networkingContacts: v })}
              max={50}
            />
            <MiniCounter
              label="Interview prep (hrs)"
              value={c.interviewPrepHours}
              onChange={(v) => setCareer({ interviewPrepHours: v })}
              max={200}
            />
          </div>
        </Panel>

        <Panel title="Skills" hint={`${c.skills.length}`}>
          <NewSkillForm onAdd={addCareerSkill} />
          <div className="mt-4 space-y-4 max-h-80 overflow-y-auto">
            {skillsByCategory.size === 0 && (
              <p className="text-sm text-muted-foreground">
                Add languages, frameworks and systems you want recruiters to notice.
              </p>
            )}
            {SKILL_CATEGORIES.map((cat) => {
              const items = skillsByCategory.get(cat.id);
              if (!items?.length) return null;
              return (
                <div key={cat.id}>
                  <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {cat.label}
                  </div>
                  <ul className="space-y-2">
                    {items.map((s) => (
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
                          type="button"
                          onClick={() => removeCareerSkill(s.id)}
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
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
                  type="button"
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
                  type="button"
                  onClick={() => removeCareerCheck(item.id)}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </li>
            ))}
            {c.checklist.length === 0 && (
              <li className="text-sm text-muted-foreground">
                e.g. &quot;Update resume&quot;, &quot;Reach out to 3 founders&quot;, &quot;Mock
                interview&quot;
              </li>
            )}
          </ul>
        </Panel>
      </Section>
    </div>
  );
}

function ActionCard({ action }: { action: { title: string; detail: string; to?: string } }) {
  const inner = (
    <>
      <div className="flex-1">
        <div className="text-sm font-medium">{action.title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{action.detail}</div>
      </div>
      {action.to && <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
    </>
  );

  if (action.to) {
    return (
      <Link
        to={action.to}
        className="flex items-start gap-3 rounded-lg border border-border bg-background/40 px-3 py-3 transition hover:bg-foreground/[0.04]"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background/40 px-3 py-3">
      {inner}
    </div>
  );
}

function BucketRow({
  label,
  desc,
  pct,
  weight,
  to,
}: {
  label: string;
  desc: string;
  pct: number;
  weight: number;
  to?: string;
}) {
  const Comp: ElementType<{ to?: string; className?: string; children?: ReactNode }> = to
    ? Link
    : "div";
  return (
    <Comp to={to} className="block group">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
        <div className="text-xs text-muted-foreground shrink-0">
          {Math.round(pct)}% · {Math.round(weight * 100)}%
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground/80 transition-[width] duration-300 ease-out group-hover:bg-accent"
          style={{ width: `${clampPercent(pct)}%` }}
        />
      </div>
    </Comp>
  );
}

function MiniCounter({
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
        onChange={(e) => onChange(Math.max(0, Math.min(max ?? 9999, +e.target.value || 0)))}
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}

function NewSkillForm({
  onAdd,
}: {
  onAdd: (name: string, level: number, category: CareerSkillCategory) => void;
}) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState(3);
  const [category, setCategory] = useState<CareerSkillCategory>("language");
  return (
    <div className="grid gap-2 md:grid-cols-[1fr,110px,120px,auto]">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Skill (e.g. TypeScript)"
        maxLength={40}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as CareerSkillCategory)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
      >
        {SKILL_CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      <select
        value={level}
        onChange={(e) => setLevel(+e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            L{n}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => {
          if (name.trim()) {
            onAdd(name.trim(), level, category);
            setName("");
          }
        }}
        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm text-background hover:opacity-90"
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
        type="button"
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
