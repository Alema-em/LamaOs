import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame, goalProgress, type Goal } from "@/hooks/use-game";
import { clampPercent } from "@/lib/progress";
import { PageHeader, Section, Panel, Stat } from "@/components/ui-kit";
import {
  Plus,
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Trash2,
  Pencil,
  Check,
  X,
  Target,
} from "lucide-react";

export const Route = createFileRoute("/goals")({
  head: () => ({ meta: [{ title: "Goals — LamaOS" }] }),
  component: GoalsPage,
});

function GoalsPage() {
  const {
    state,
    createGoal,
    updateGoal,
    deleteGoal,
    togglePinGoal,
    archiveGoal,
    addGoalMilestone,
    toggleGoalMilestone,
    removeGoalMilestone,
    addGoalCategory,
  } = useGame();

  const [tab, setTab] = useState<"active" | "archived">("active");
  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const list = useMemo(
    () =>
      state.goals
        .filter((g) => (tab === "active" ? !g.archived : g.archived))
        .filter((g) => filter === "all" || g.category === filter)
        .sort((a, b) => Number(b.pinned) - Number(a.pinned)),
    [state.goals, tab, filter],
  );

  const overall = state.goals.filter((g) => !g.archived);
  const avg = overall.length
    ? overall.reduce((a, g) => a + goalProgress(g), 0) / overall.length
    : 0;
  const dueSoon = overall.filter(
    (g) => g.targetDate && (new Date(g.targetDate).getTime() - Date.now()) / 86400000 <= 14,
  ).length;

  return (
    <div>
      <PageHeader
        eyebrow="North Star"
        title="Goals"
        subtitle="The few things that, when honored daily, change everything."
        action={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New goal
          </button>
        }
      />

      <Section className="grid grid-cols-2 gap-x-10 gap-y-8 border-b border-border md:grid-cols-4">
        <Stat label="Active" value={overall.length} />
        <Stat label="Average progress" value={`${Math.round(avg)}%`} accent />
        <Stat label="Pinned" value={overall.filter((g) => g.pinned).length} />
        <Stat label="Due within 2 weeks" value={dueSoon} />
      </Section>

      <Section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Toggle active={tab === "active"} onClick={() => setTab("active")}>
              Active
            </Toggle>
            <Toggle active={tab === "archived"} onClick={() => setTab("archived")}>
              Archived
            </Toggle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Category</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs"
            >
              <option value="all">All</option>
              {state.goalCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {creating && (
          <GoalForm
            categories={state.goalCategories}
            onAddCategory={addGoalCategory}
            onCancel={() => setCreating(false)}
            onSave={(data) => {
              createGoal(data);
              setCreating(false);
            }}
          />
        )}

        {list.length === 0 && !creating && (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-10">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-muted text-muted-foreground">
              <Target className="h-4 w-4" />
            </div>
            <div className="font-display text-xl">No {tab} goals yet</div>
            <p className="max-w-md text-sm text-muted-foreground">
              {tab === "active"
                ? "Goals you create here power your dashboard, analytics, and forecasts. Start with one."
                : "Anything you archive will be kept here as a record of what you outgrew."}
            </p>
            {tab === "active" && (
              <button
                onClick={() => setCreating(true)}
                className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Create your first goal
              </button>
            )}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {list.map((g) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                layout
              >
                {editing === g.id ? (
                  <GoalForm
                    categories={state.goalCategories}
                    onAddCategory={addGoalCategory}
                    initial={g}
                    onCancel={() => setEditing(null)}
                    onSave={(data) => {
                      updateGoal(g.id, data);
                      setEditing(null);
                    }}
                  />
                ) : (
                  <GoalCard
                    g={g}
                    onPin={() => togglePinGoal(g.id)}
                    onArchive={() => archiveGoal(g.id, !g.archived)}
                    onDelete={() => {
                      if (confirm("Delete this goal forever?")) deleteGoal(g.id);
                    }}
                    onEdit={() => setEditing(g.id)}
                    onAddMilestone={(t) => addGoalMilestone(g.id, t)}
                    onToggleMilestone={(mid) => toggleGoalMilestone(g.id, mid)}
                    onRemoveMilestone={(mid) => removeGoalMilestone(g.id, mid)}
                    onProgress={(p) => updateGoal(g.id, { manualProgress: p })}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Section>
    </div>
  );
}

function Toggle({
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

function GoalCard({
  g,
  onPin,
  onArchive,
  onDelete,
  onEdit,
  onAddMilestone,
  onToggleMilestone,
  onRemoveMilestone,
  onProgress,
}: {
  g: Goal;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onAddMilestone: (t: string) => void;
  onToggleMilestone: (mid: string) => void;
  onRemoveMilestone: (mid: string) => void;
  onProgress: (p: number) => void;
}) {
  const pct = goalProgress(g);
  const [m, setM] = useState("");
  const daysLeft = g.targetDate
    ? Math.ceil((new Date(g.targetDate).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className="group rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {g.category}
          </div>
          <div className="mt-1 truncate font-display text-xl">{g.title}</div>
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-70 transition group-hover:opacity-100">
          <IconBtn onClick={onPin} title={g.pinned ? "Unpin" : "Pin"}>
            {g.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          </IconBtn>
          <IconBtn onClick={onEdit} title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn onClick={onArchive} title={g.archived ? "Restore" : "Archive"}>
            {g.archived ? (
              <ArchiveRestore className="h-3.5 w-3.5" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
          </IconBtn>
          <IconBtn onClick={onDelete} title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
      </div>

      {g.description && <p className="mt-2 text-sm text-muted-foreground">{g.description}</p>}

      <div className="mt-4">
        <div className="mb-1 flex items-baseline justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground/80 transition-[width] duration-300 ease-out"
            style={{ width: `${clampPercent(pct)}%` }}
          />
        </div>
        {g.milestones.length === 0 && (
          <div className="mt-3">
            <input
              type="range"
              min={0}
              max={100}
              value={g.manualProgress}
              onChange={(e) => onProgress(+e.target.value)}
              className="w-full accent-foreground"
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        {g.targetDate && (
          <span>
            Target {g.targetDate}
            {daysLeft !== null && daysLeft >= 0
              ? ` · ${daysLeft}d left`
              : daysLeft !== null
                ? " · overdue"
                : ""}
          </span>
        )}
        <span>Created {g.createdAt}</span>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Milestones
        </div>
        <ul className="space-y-1.5">
          {g.milestones.map((ms) => (
            <li key={ms.id} className="group/m flex items-center gap-2">
              <button
                onClick={() => onToggleMilestone(ms.id)}
                className={`grid h-4 w-4 place-items-center rounded border ${ms.done ? "border-foreground bg-foreground text-background" : "border-border"}`}
              >
                {ms.done && <Check className="h-2.5 w-2.5" />}
              </button>
              <span
                className={`flex-1 text-sm ${ms.done ? "line-through text-muted-foreground" : ""}`}
              >
                {ms.title}
              </span>
              <button
                onClick={() => onRemoveMilestone(ms.id)}
                className="opacity-0 transition group-hover/m:opacity-100"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex gap-2">
          <input
            value={m}
            onChange={(e) => setM(e.target.value)}
            placeholder="Add a milestone"
            onKeyDown={(e) => {
              if (e.key === "Enter" && m.trim()) {
                onAddMilestone(m.trim());
                setM("");
              }
            }}
            className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs"
          />
          <button
            onClick={() => {
              if (m.trim()) {
                onAddMilestone(m.trim());
                setM("");
              }
            }}
            className="rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-foreground hover:text-background"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="rounded-md p-1.5 text-muted-foreground transition hover:bg-foreground/[0.06] hover:text-foreground"
    >
      {children}
    </button>
  );
}

function GoalForm({
  initial,
  categories,
  onAddCategory,
  onCancel,
  onSave,
}: {
  initial?: Goal;
  categories: string[];
  onAddCategory: (c: string) => void;
  onCancel: () => void;
  onSave: (g: Pick<Goal, "title" | "description" | "category" | "targetDate">) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [cat, setCat] = useState(initial?.category ?? categories[0] ?? "Career");
  const [target, setTarget] = useState(initial?.targetDate ?? "");
  const [newCat, setNewCat] = useState("");

  return (
    <Panel
      className="md:col-span-2"
      title={initial ? "Edit goal" : "New goal"}
      hint={initial ? "Refining" : "Beginning"}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-xs text-muted-foreground">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="e.g. Ship BrandForge MVP"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-muted-foreground">Why it matters</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="A sentence that you'll be grateful for on hard days."
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Category</label>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div className="mt-2 flex gap-2">
            <input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="New category"
              className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs"
            />
            <button
              onClick={() => {
                if (newCat.trim()) {
                  onAddCategory(newCat.trim());
                  setCat(newCat.trim());
                  setNewCat("");
                }
              }}
              className="rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-foreground hover:text-background"
            >
              Add
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Target date</label>
          <input
            type="date"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button
          disabled={!title.trim()}
          onClick={() =>
            onSave({
              title: title.trim(),
              description: desc.trim() || undefined,
              category: cat,
              targetDate: target || undefined,
            })
          }
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-40"
        >
          {initial ? "Save" : "Create goal"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </Panel>
  );
}
