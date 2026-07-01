import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGame,
  projectProgress,
  type Project,
  type ProjectTask,
  type ProjectStatus,
  type Priority,
} from "@/hooks/use-game";
import { PageHeader, Section, Panel, Stat } from "@/components/ui-kit";
import { clampPercent, averagePercent } from "@/lib/progress";
import {
  Plus,
  Pin,
  Trash2,
  Check,
  ExternalLink,
  ChevronRight,
  FolderKanban,
  CircleDashed,
  ArrowLeft,
  Calendar,
  Flag,
} from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Projects — LamaOS" }] }),
  component: ProjectsPage,
});

const STATUSES: ProjectStatus[] = ["planning", "active", "paused", "shipped", "archived"];
const PRIORITIES: Priority[] = ["low", "med", "high"];

function ProjectsPage() {
  const { state } = useGame();
  const [openId, setOpenId] = useState<string | null>(null);

  const open = state.projects.find((p) => p.id === openId);
  if (open) return <ProjectDetail project={open} onBack={() => setOpenId(null)} />;

  const active = state.projects.filter((p) => p.status !== "archived");
  const archived = state.projects.filter((p) => p.status === "archived");
  const shipped = state.projects.filter((p) => p.status === "shipped").length;

  const totalTasks = state.projects.reduce((a, p) => a + p.tasks.length, 0);
  const doneTasks = state.projects.reduce((a, p) => a + p.tasks.filter((t) => t.done).length, 0);
  const totalMs = state.projects.reduce((a, p) => a + p.milestones.length, 0);
  const doneMs = state.projects.reduce((a, p) => a + p.milestones.filter((m) => m.done).length, 0);
  const totalItems = totalTasks + totalMs;
  const doneItems = doneTasks + doneMs;
  const hasData = state.projects.length > 0;
  const completionPct = averagePercent(state.projects.map((p) => projectProgress(p)));
  const openTasks = totalTasks - doneTasks;

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        subtitle="Every project that matters. Studio work, research, side bets — all in one place."
      />

      <Section className="grid grid-cols-2 gap-x-10 gap-y-8 border-b border-border md:grid-cols-4">
        <Stat label="Active" value={active.length} />
        <Stat
          label="Completion"
          value={hasData ? `${completionPct}%` : "No data available"}
          sub={hasData ? `${doneItems}/${totalItems} tasks + milestones` : undefined}
          accent
        />
        <Stat label="Shipped" value={shipped} />
        <Stat label="Open tasks" value={openTasks} />
      </Section>

      <Section>
        <NewProjectForm />
      </Section>

      <Section>
        <h3 className="mb-4 font-display text-2xl">Active</h3>
        {active.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
            <FolderKanban className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <div className="font-display text-xl">No projects yet</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first project above — BrandForge, LamaOS, anything you're building.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {active.map((p) => (
              <ProjectCard key={p.id} project={p} onOpen={() => setOpenId(p.id)} />
            ))}
          </div>
        )}
      </Section>

      {archived.length > 0 && (
        <Section className="pb-16">
          <h3 className="mb-4 font-display text-2xl">Archived</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {archived.map((p) => (
              <ProjectCard key={p.id} project={p} onOpen={() => setOpenId(p.id)} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function NewProjectForm() {
  const { createProject } = useGame();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("planning");
  const [priority, setPriority] = useState<Priority>("med");
  const [deadline, setDeadline] = useState("");

  return (
    <Panel title="New project">
      <div className="grid gap-3 md:grid-cols-[1.4fr,2fr,140px,140px,160px,auto]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          maxLength={80}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description (optional)"
          maxLength={200}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p} priority
            </option>
          ))}
        </select>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={() => {
            if (!name.trim()) return;
            createProject({
              name: name.trim(),
              description: desc.trim() || undefined,
              status,
              priority,
              deadline: deadline || undefined,
              startDate: new Date().toISOString().slice(0, 10),
            });
            setName("");
            setDesc("");
            setDeadline("");
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </Panel>
  );
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const { toggleProjectPin, deleteProject } = useGame();
  const pct = projectProgress(project);
  const openTasks = project.tasks.filter((t) => !t.done).length;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl border border-border bg-card p-5 transition hover:bg-foreground/[0.03]"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 cursor-pointer" onClick={onOpen}>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className={statusColor(project.status)}>{project.status}</span>
            <span>·</span>
            <span>{project.priority} priority</span>
          </div>
          <div className="mt-2 font-display text-xl leading-snug">{project.name}</div>
          {project.description && (
            <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {project.description}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => toggleProjectPin(project.id)}
            title="Pin"
            className="rounded-md p-1.5 hover:bg-muted"
          >
            <Pin
              className={`h-3.5 w-3.5 ${project.pinned ? "fill-current text-accent" : "text-muted-foreground"}`}
            />
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${project.name}"?`)) deleteProject(project.id);
            }}
            title="Delete"
            className="rounded-md p-1.5 hover:bg-muted"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground/80 transition-[width] duration-300 ease-out"
          style={{ width: `${clampPercent(pct)}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {Math.round(pct)}% · {openTasks} open task{openTasks === 1 ? "" : "s"}
        </span>
        {project.deadline && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {project.deadline}
          </span>
        )}
      </div>
      <button
        onClick={onOpen}
        className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-md border border-border py-2 text-xs hover:bg-foreground hover:text-background"
      >
        Open <ChevronRight className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

function statusColor(s: ProjectStatus) {
  if (s === "active") return "text-accent-foreground";
  if (s === "shipped") return "text-sage";
  if (s === "paused") return "text-muted-foreground";
  return "text-muted-foreground";
}

// ============================================
// Project Detail
// ============================================
function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const {
    updateProject,
    addProjectTask,
    toggleProjectTask,
    setProjectTaskStatus,
    deleteProjectTask,
    addProjectMilestone,
    toggleProjectMilestone,
    deleteProjectMilestone,
    addProjectNote,
    addProjectLink,
  } = useGame();
  const [view, setView] = useState<"board" | "timeline" | "overview">("overview");
  const [newTask, setNewTask] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("med");
  const [newMilestone, setNewMilestone] = useState("");
  const [newNote, setNewNote] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const pct = projectProgress(project);
  const completionRate = pct;

  // Velocity: tasks completed in last 14 days / 2 = per week
  const velocity = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    const recent = project.tasks.filter((t) => t.doneAt && new Date(t.doneAt) >= cutoff).length;
    return +(recent / 2).toFixed(1);
  }, [project.tasks]);

  // Predicted completion
  const predicted = useMemo(() => {
    const remaining = project.tasks.filter((t) => !t.done).length;
    if (!remaining || velocity === 0) return null;
    const weeks = remaining / velocity;
    const d = new Date();
    d.setDate(d.getDate() + Math.ceil(weeks * 7));
    return d.toISOString().slice(0, 10);
  }, [project.tasks, velocity]);

  const timeRemaining = project.deadline
    ? Math.round((new Date(project.deadline).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div>
      <PageHeader
        eyebrow={
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Projects
          </button>
        }
        title={project.name}
        subtitle={project.description}
        action={
          <select
            value={project.status}
            onChange={(e) => updateProject(project.id, { status: e.target.value as ProjectStatus })}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        }
      />

      <Section className="grid grid-cols-2 gap-x-10 gap-y-8 border-b border-border md:grid-cols-4">
        <Stat label="Progress" value={`${Math.round(pct)}%`} accent />
        <Stat label="Completion rate" value={`${Math.round(completionRate)}%`} />
        <Stat label="Velocity" value={`${velocity}/wk`} sub="last 14 days" />
        <Stat
          label="Predicted finish"
          value={predicted ?? "—"}
          sub={timeRemaining !== null ? `${timeRemaining} days until deadline` : "No deadline"}
        />
      </Section>

      {/* View tabs */}
      <Section className="border-b border-border">
        <div className="flex flex-wrap gap-2">
          {(["overview", "board", "timeline"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-full border px-4 py-1.5 text-xs capitalize transition ${
                view === v
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </Section>

      {view === "board" && (
        <Section>
          <Panel title="Kanban" hint={`${project.tasks.length} tasks`}>
            <div className="mb-4 grid gap-2 md:grid-cols-[1fr,160px,140px,auto]">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a task"
                maxLength={120}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={newTaskDue}
                onChange={(e) => setNewTaskDue(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (newTask.trim()) {
                    addProjectTask(project.id, {
                      title: newTask.trim(),
                      due: newTaskDue || undefined,
                      priority: newTaskPriority,
                    });
                    setNewTask("");
                    setNewTaskDue("");
                  }
                }}
                className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
              >
                Add
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {(["todo", "doing", "done"] as const).map((col) => (
                <div key={col} className="rounded-xl border border-border bg-background/40 p-3">
                  <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    <span>{col}</span>
                    <span>
                      {
                        project.tasks.filter(
                          (t) => (t.status ?? (t.done ? "done" : "todo")) === col,
                        ).length
                      }
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {project.tasks
                      .filter((t) => (t.status ?? (t.done ? "done" : "todo")) === col)
                      .map((t) => (
                        <li
                          key={t.id}
                          className="group rounded-lg border border-border bg-card px-3 py-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className={`text-sm ${t.done ? "line-through opacity-60" : ""}`}>
                              {t.title}
                            </div>
                            <button
                              onClick={() => deleteProjectTask(project.id, t.id)}
                              className="opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-2">
                              {t.due && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {t.due}
                                </span>
                              )}
                              {t.priority && (
                                <span className="flex items-center gap-1">
                                  <Flag className="h-3 w-3" />
                                  {t.priority}
                                </span>
                              )}
                            </div>
                            <select
                              value={t.status ?? (t.done ? "done" : "todo")}
                              onChange={(e) =>
                                setProjectTaskStatus(
                                  project.id,
                                  t.id,
                                  e.target.value as "todo" | "doing" | "done",
                                )
                              }
                              className="rounded border border-border bg-background px-1 py-0.5 text-[10px]"
                            >
                              <option value="todo">todo</option>
                              <option value="doing">doing</option>
                              <option value="done">done</option>
                            </select>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </Panel>
        </Section>
      )}

      {view === "timeline" && (
        <Section>
          <Panel title="Timeline" hint="Milestones">
            <div className="mb-4 flex gap-2">
              <input
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                placeholder="New milestone"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                onClick={() => {
                  if (newMilestone.trim()) {
                    addProjectMilestone(project.id, newMilestone.trim());
                    setNewMilestone("");
                  }
                }}
                className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
              >
                Add
              </button>
            </div>
            {project.milestones.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                No milestones yet — outline your shipping arc above.
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
                <ul className="space-y-3">
                  {project.milestones.map((m, i) => (
                    <motion.li
                      key={m.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="group relative pl-10"
                    >
                      <button
                        onClick={() => toggleProjectMilestone(project.id, m.id)}
                        className={`absolute left-0 top-2 grid h-6 w-6 place-items-center rounded-full border ${
                          m.done
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {m.done ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <CircleDashed className="h-3 w-3" />
                        )}
                      </button>
                      <div
                        className={`flex items-center justify-between rounded-xl border border-border px-4 py-3 ${m.done ? "bg-foreground/[0.03]" : "bg-card"}`}
                      >
                        <div
                          className={`text-sm font-medium ${m.done ? "line-through opacity-60" : ""}`}
                        >
                          {m.title}
                        </div>
                        <div className="flex items-center gap-2">
                          {m.date && (
                            <span className="text-xs text-muted-foreground">{m.date}</span>
                          )}
                          <button
                            onClick={() => deleteProjectMilestone(project.id, m.id)}
                            className="opacity-0 transition group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>
        </Section>
      )}

      {view === "overview" && (
        <>
          <Section className="grid gap-6 lg:grid-cols-2">
            <Panel title="Quick task" hint="Add">
              <div className="grid gap-2 md:grid-cols-[1fr,140px,auto]">
                <input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="What's next?"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (newTask.trim()) {
                      addProjectTask(project.id, {
                        title: newTask.trim(),
                        priority: newTaskPriority,
                      });
                      setNewTask("");
                    }
                  }}
                  className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
                >
                  Add
                </button>
              </div>
              <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
                <AnimatePresence>
                  {project.tasks.slice(0, 12).map((t) => (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group flex items-center gap-3 rounded-lg border border-border px-3 py-2"
                    >
                      <button
                        onClick={() => toggleProjectTask(project.id, t.id)}
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${t.done ? "border-foreground bg-foreground text-background" : "border-border"}`}
                      >
                        {t.done && <Check className="h-3 w-3" />}
                      </button>
                      <span
                        className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}
                      >
                        {t.title}
                      </span>
                      {t.due && <span className="text-[10px] text-muted-foreground">{t.due}</span>}
                      <button
                        onClick={() => deleteProjectTask(project.id, t.id)}
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {project.tasks.length === 0 && (
                  <div className="text-sm text-muted-foreground">No tasks yet.</div>
                )}
              </div>
            </Panel>

            <Panel
              title="Milestones"
              hint={`${project.milestones.filter((m) => m.done).length}/${project.milestones.length}`}
            >
              <div className="mb-3 flex gap-2">
                <input
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  placeholder="New milestone"
                  className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <button
                  onClick={() => {
                    if (newMilestone.trim()) {
                      addProjectMilestone(project.id, newMilestone.trim());
                      setNewMilestone("");
                    }
                  }}
                  className="rounded-md bg-foreground px-3 py-2 text-sm text-background hover:opacity-90"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {project.milestones.map((m) => (
                  <li
                    key={m.id}
                    className="group flex items-center gap-3 rounded-lg border border-border px-3 py-2"
                  >
                    <button
                      onClick={() => toggleProjectMilestone(project.id, m.id)}
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${m.done ? "border-foreground bg-foreground text-background" : "border-border"}`}
                    >
                      {m.done && <Check className="h-3 w-3" />}
                    </button>
                    <span
                      className={`flex-1 text-sm ${m.done ? "line-through text-muted-foreground" : ""}`}
                    >
                      {m.title}
                    </span>
                    <button
                      onClick={() => deleteProjectMilestone(project.id, m.id)}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </li>
                ))}
                {project.milestones.length === 0 && (
                  <li className="text-sm text-muted-foreground">No milestones yet.</li>
                )}
              </ul>
            </Panel>
          </Section>

          <Section className="grid gap-6 lg:grid-cols-2 pb-16">
            <Panel title="Notes" hint={`${project.notes.length}`}>
              <div className="mb-3 flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a quick note"
                  className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  rows={2}
                />
                <button
                  onClick={() => {
                    if (newNote.trim()) {
                      addProjectNote(project.id, newNote.trim());
                      setNewNote("");
                    }
                  }}
                  className="self-start rounded-md bg-foreground px-3 py-2 text-sm text-background hover:opacity-90"
                >
                  Save
                </button>
              </div>
              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {project.notes.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-lg border border-border bg-card/60 px-3 py-2 text-sm"
                  >
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {n.date}
                    </div>
                    <div className="mt-1 whitespace-pre-wrap">{n.body}</div>
                  </li>
                ))}
                {project.notes.length === 0 && (
                  <li className="text-sm text-muted-foreground">No notes yet.</li>
                )}
              </ul>
            </Panel>

            <Panel title="Links & files" hint={`${project.links.length}`}>
              <div className="mb-3 grid gap-2 md:grid-cols-[1fr,1.4fr,auto]">
                <input
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder="Label"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <button
                  onClick={() => {
                    if (linkLabel.trim() && linkUrl.trim()) {
                      addProjectLink(project.id, linkLabel.trim(), linkUrl.trim());
                      setLinkLabel("");
                      setLinkUrl("");
                    }
                  }}
                  className="rounded-md bg-foreground px-3 py-2 text-sm text-background hover:opacity-90"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-2">
                {project.links.map((l) => (
                  <li key={l.id}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-foreground hover:text-background"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="truncate">{l.label}</span>
                    </a>
                  </li>
                ))}
                {project.links.length === 0 && (
                  <li className="text-sm text-muted-foreground">No links yet.</li>
                )}
              </ul>
            </Panel>
          </Section>
        </>
      )}
    </div>
  );
}
