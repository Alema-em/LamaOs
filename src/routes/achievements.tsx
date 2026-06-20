import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  useGame,
  type Application,
  type GameState,
  type Project,
  type ProjectMilestone,
} from "@/hooks/use-game";
import { PageHeader, Section } from "@/components/ui-kit";
import { Trophy, Lock } from "lucide-react";

export const Route = createFileRoute("/achievements")({
  head: () => ({ meta: [{ title: "Achievements — LamaOS" }] }),
  component: Achievements,
});

interface Def {
  id: string;
  title: string;
  description: string;
  check: (s: GameState) => boolean;
}

const DEFS: Def[] = [
  {
    id: "first-app",
    title: "First Internship Application",
    description: "The first knock on the door.",
    check: (s) => s.internships.applications.length >= 1,
  },
  {
    id: "dsa-10",
    title: "10 DSA Problems",
    description: "The forest is finding its rhythm.",
    check: (s) => s.dsa.problems.length >= 10,
  },
  {
    id: "dsa-50",
    title: "50 DSA Problems",
    description: "Patterns whisper themselves now.",
    check: (s) => s.dsa.problems.length >= 50,
  },
  {
    id: "dsa-100",
    title: "100 DSA Problems",
    description: "A canopy that filters the sun.",
    check: (s) => s.dsa.problems.length >= 100,
  },
  {
    id: "lose-5",
    title: "Lost 5kg",
    description: "Lighter on the trail, brighter in the eyes.",
    check: (s) => s.fitness.start - s.fitness.current >= 5,
  },
  {
    id: "lose-10",
    title: "Lost 10kg",
    description: "Patience compounding.",
    check: (s) => s.fitness.start - s.fitness.current >= 10,
  },
  {
    id: "first-project",
    title: "First Project Shipped",
    description: "The studio has a running heartbeat.",
    check: (s) =>
      (s.projects || []).some(
        (p: Project) =>
          p.status === "shipped" ||
          p.milestones?.filter((m: ProjectMilestone) => m.done).length >= 4,
      ),
  },
  {
    id: "tech-intern",
    title: "Technical Internship Secured",
    description: "A door opens. You walk in.",
    check: (s) => s.internships.applications.some((a: Application) => a.status === "offer"),
  },
  {
    id: "streak-30",
    title: "30-Day Streak",
    description: "A new gravity.",
    check: (s) => s.streak >= 30,
  },
  { id: "level-10", title: "Level 10", description: "Quiet mastery.", check: (s) => s.level >= 10 },
];

function Achievements() {
  const { state } = useGame();
  const earned = DEFS.filter((d) => d.check(state) || state.achievements.includes(d.id));
  const locked = DEFS.filter((d) => !earned.includes(d));

  return (
    <div>
      <PageHeader
        eyebrow="Collection"
        title="Achievements"
        subtitle="Quiet trophies. Each one earned with real days."
        action={
          <div className="rounded-full border border-border px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {earned.length} / {DEFS.length} collected
          </div>
        }
      />

      <Section>
        <h3 className="mb-4 font-display text-xl">Earned</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {earned.map((d, i) => (
            <Card key={d.id} d={d} earned i={i} />
          ))}
          {earned.length === 0 && (
            <div className="text-sm text-muted-foreground">Your first one is waiting.</div>
          )}
        </div>
      </Section>

      <Section className="pb-16">
        <h3 className="mb-4 font-display text-xl">In progress</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locked.map((d, i) => (
            <Card key={d.id} d={d} i={i} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Card({ d, earned, i }: { d: Def; earned?: boolean; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-2xl border p-5 transition ${
        earned ? "border-accent/40 bg-card shadow-soft" : "border-border bg-card/50"
      }`}
    >
      {earned && (
        <div
          className="absolute inset-0 -z-0 opacity-50"
          style={{
            background:
              "radial-gradient(120% 80% at 80% 0%, color-mix(in oklab, var(--gold) 22%, transparent) 0%, transparent 60%)",
          }}
        />
      )}
      <div className="relative flex items-start gap-4">
        <div
          className={`grid h-12 w-12 place-items-center rounded-xl ${
            earned
              ? "bg-gradient-to-br from-accent to-accent/70 text-accent-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {earned ? <Trophy className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
        </div>
        <div>
          <div className="font-display text-lg">{d.title}</div>
          <div className="mt-1 text-sm text-muted-foreground">{d.description}</div>
        </div>
      </div>
    </motion.div>
  );
}
