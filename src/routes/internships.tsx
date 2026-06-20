import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { useGame, type ApplicationStatus } from "@/hooks/use-game";
import { PageHeader, Section, Panel, Stat } from "@/components/ui-kit";
import { clampPercent } from "@/lib/progress";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/internships")({
  head: () => ({ meta: [{ title: "Internships — LamaOS" }] }),
  component: Internships,
});

const STAGES: { id: ApplicationStatus; label: string }[] = [
  { id: "applied", label: "Applied" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Rejected" },
];

function Internships() {
  const { state, addApplication, setApplicationStatus, deleteApplication, setInternshipsGoal } =
    useGame();
  const apps = state.internships.applications;
  const goal = state.internships.goal;
  const submitted = apps.length;
  const pct = goal > 0 ? clampPercent((submitted / goal) * 100) : 0;

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [goalInput, setGoalInput] = useState<number | "">(goal || "");

  const count = (s: ApplicationStatus) => apps.filter((a) => a.status === s).length;

  return (
    <div>
      <PageHeader
        eyebrow="Career"
        title="Internships"
        subtitle="A calm pipeline. Apply with intent. Reflect after each conversation."
      />

      <Section className="grid grid-cols-2 gap-x-10 gap-y-8 border-b border-border md:grid-cols-4">
        <Stat label="Submitted" value={submitted} sub={goal > 0 ? `Goal ${goal}` : "Set a goal"} />
        <Stat
          label="Progress"
          value={goal > 0 ? `${Math.round(pct)}%` : "No data available"}
          accent
        />
        <Stat label="Interviews" value={count("interview")} />
        <Stat label="Offers" value={count("offer")} />
      </Section>

      {goal === 0 && (
        <Section>
          <Panel title="Set an application goal" hint="Begin">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs text-muted-foreground">
                  Total applications to submit
                </label>
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
                  if (typeof goalInput === "number" && goalInput > 0) setInternshipsGoal(goalInput);
                }}
                className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
              >
                Save goal
              </button>
              <p className="text-xs text-muted-foreground">
                Progress is tracked against this number.
              </p>
            </div>
          </Panel>
        </Section>
      )}

      <Section>
        <Panel title="Add application" hint="New">
          <div className="grid gap-3 md:grid-cols-[1fr,1fr,auto]">
            <input
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              maxLength={80}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              maxLength={80}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={() => {
                if (!company.trim() || !role.trim()) return;
                addApplication({ company: company.trim(), role: role.trim(), status: "applied" });
                setCompany("");
                setRole("");
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </Panel>
      </Section>

      <Section className="pb-16">
        {apps.length === 0 && (
          <div className="mb-6 rounded-2xl border border-dashed border-border bg-card/40 p-8 text-sm text-muted-foreground">
            No applications yet. Add your first company above — even one entry turns this into a
            real pipeline.
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STAGES.map((stage) => (
            <div key={stage.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-lg">{stage.label}</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {count(stage.id)}
                </span>
              </div>
              <div className="space-y-2">
                {apps
                  .filter((a) => a.status === stage.id)
                  .map((a) => (
                    <motion.div
                      key={a.id}
                      layoutId={a.id}
                      className="group rounded-xl border border-border bg-background/60 p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{a.company}</div>
                          <div className="truncate text-xs text-muted-foreground">{a.role}</div>
                        </div>
                        <button
                          onClick={() => deleteApplication(a.id)}
                          className="opacity-0 transition group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {a.date}
                        </div>
                        <select
                          value={a.status}
                          onChange={(e) =>
                            setApplicationStatus(a.id, e.target.value as ApplicationStatus)
                          }
                          className="rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px]"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  ))}
                {apps.filter((a) => a.status === stage.id).length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
