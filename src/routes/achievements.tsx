import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useGame } from "@/hooks/use-game";
import { ACHIEVEMENT_DEFS, getEarnedAchievements, type AchievementDef } from "@/lib/achievements";
import { PageHeader, Section } from "@/components/ui-kit";
import { Trophy, Lock } from "lucide-react";

export const Route = createFileRoute("/achievements")({
  head: () => ({ meta: [{ title: "Achievements — LamaOS" }] }),
  component: Achievements,
});

function Achievements() {
  const { state } = useGame();
  const earned = getEarnedAchievements(state);
  const earnedIds = new Set(earned.map((d) => d.id));
  const locked = ACHIEVEMENT_DEFS.filter((d) => !earnedIds.has(d.id));

  return (
    <div>
      <PageHeader
        eyebrow="Collection"
        title="Achievements"
        subtitle="Quiet trophies. Each one earned with real days."
        action={
          <div className="rounded-full border border-border px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {earned.length} / {ACHIEVEMENT_DEFS.length} collected
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

function Card({ d, earned, i }: { d: AchievementDef; earned?: boolean; i: number }) {
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
