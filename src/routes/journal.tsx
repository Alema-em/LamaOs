import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame, type JournalEntry } from "@/hooks/use-game";
import { PageHeader, Section, Panel, Stat } from "@/components/ui-kit";
import { Plus, Trash2, BookOpen } from "lucide-react";

export const Route = createFileRoute("/journal")({
  head: () => ({ meta: [{ title: "Journal — LamaOS" }] }),
  component: JournalPage,
});

const KIND_LABEL: Record<JournalEntry["kind"], string> = {
  daily: "Daily note",
  weekly: "Weekly review",
  monthly: "Monthly review",
};

function JournalPage() {
  const { state, addJournal, deleteJournal } = useGame();
  const [kind, setKind] = useState<JournalEntry["kind"]>("daily");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<JournalEntry["mood"] | undefined>(undefined);
  const [filter, setFilter] = useState<JournalEntry["kind"] | "all">("all");

  const entries = useMemo(
    () =>
      [...state.journal]
        .filter((e) => filter === "all" || e.kind === filter)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [state.journal, filter],
  );

  const counts = {
    daily: state.journal.filter((e) => e.kind === "daily").length,
    weekly: state.journal.filter((e) => e.kind === "weekly").length,
    monthly: state.journal.filter((e) => e.kind === "monthly").length,
  };

  function save() {
    if (!body.trim()) return;
    addJournal({ kind, title: title.trim() || undefined, body: body.trim(), mood });
    setTitle("");
    setBody("");
    setMood(undefined);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Reflection"
        title="Journal"
        subtitle="Daily notes, weekly reviews, monthly intentions. Memory becomes momentum."
      />

      <Section className="grid grid-cols-2 gap-x-10 gap-y-8 border-b border-border md:grid-cols-4">
        <Stat label="Entries" value={state.journal.length} />
        <Stat label="Daily" value={counts.daily} accent />
        <Stat label="Weekly" value={counts.weekly} />
        <Stat label="Monthly" value={counts.monthly} />
      </Section>

      <Section className="grid gap-6 lg:grid-cols-[1fr,1.4fr]">
        <Panel title="New entry" hint={KIND_LABEL[kind]}>
          <div className="mb-4 flex gap-2">
            {(["daily", "weekly", "monthly"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`rounded-full border px-3 py-1.5 text-xs capitalize transition ${
                  kind === k
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="Optional title"
            className="mb-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={kind === "daily" ? 6 : 10}
            maxLength={4000}
            placeholder={
              kind === "daily"
                ? "Today, what was true? What did you ship? What can wait?"
                : kind === "weekly"
                  ? "This week: wins, lessons, one thing to change next week."
                  : "This month: themes, big moves, what's the one thing the next month asks of you?"
            }
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed"
          />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Mood
              </span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setMood(mood === n ? undefined : (n as 1 | 2 | 3 | 4 | 5))}
                  className={`h-6 w-6 rounded-full border text-[11px] transition ${
                    mood === n
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={save}
              disabled={!body.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" /> Save
            </button>
          </div>
        </Panel>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-xl">Recent entries</h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as JournalEntry["kind"] | "all")}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs"
            >
              <option value="all">All</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          {entries.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-8">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-muted text-muted-foreground">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="font-display text-lg">A blank page</div>
              <p className="max-w-md text-sm text-muted-foreground">
                Write something true today. It only takes a sentence to start a habit.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {entries.map((e) => (
                  <motion.div
                    key={e.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="rounded-2xl border border-border bg-card p-5"
                  >
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-3">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {e.kind}
                        </span>
                        <span className="text-xs text-muted-foreground">{e.date}</span>
                        {e.mood && (
                          <span className="text-xs text-muted-foreground">· mood {e.mood}/5</span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteJournal(e.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {e.title && <div className="mt-2 font-display text-lg">{e.title}</div>}
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{e.body}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
