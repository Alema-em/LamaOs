import { motion } from "framer-motion";
import { BookOpen, Code2, Footprints } from "lucide-react";
import { Mochi } from "@/components/Mochi";
import { clampPercent } from "@/lib/progress";

const ease = [0.22, 1, 0.36, 1] as const;

function dsaCellBg(count: number) {
  if (count === 0) return "color-mix(in oklab, var(--foreground) 5%, transparent)";
  return `color-mix(in oklab, var(--gold) ${30 + count * 22}%, transparent)`;
}

/** 84 cells — mirrors the real 12×7 DSA activity grid. */
const DSA_DEMO = [
  0, 0, 1, 0, 0, 2, 0, 1, 0, 0, 3, 0, 0, 2, 1, 0, 0, 0, 1, 2, 0, 0, 1, 0, 0, 0, 2, 1, 0, 3, 0, 1, 0,
  0, 2, 0, 1, 0, 0, 0, 1, 0, 2, 3, 0, 1, 0, 0, 2, 0, 1, 0, 0, 0, 1, 2, 0, 0, 1, 0, 0, 2, 1, 0, 0, 1,
  0, 3, 0, 2, 0, 1, 0, 0, 0, 2, 1, 0, 0, 1, 0, 2, 0,
] as const;

const STEP_DEMO = [
  { day: "04", pct: 100, complete: true },
  { day: "05", pct: 72, complete: false },
  { day: "06", pct: 45, complete: false },
  { day: "07", pct: 0, complete: false, empty: true },
  { day: "08", pct: 88, complete: false },
  { day: "09", pct: 100, complete: true },
  { day: "10", pct: 61, complete: false },
  { day: "11", pct: 100, complete: true },
  { day: "12", pct: 34, complete: false },
  { day: "13", pct: 0, complete: false, empty: true },
  { day: "14", pct: 92, complete: false },
  { day: "15", pct: 100, complete: true },
  { day: "16", pct: 55, complete: false },
  { day: "17", pct: 78, complete: false },
  { day: "18", pct: 100, complete: true },
  { day: "19", pct: 41, complete: false },
  { day: "20", pct: 100, complete: true },
  { day: "21", pct: 67, complete: false },
  { day: "22", pct: 0, complete: false, empty: true },
  { day: "23", pct: 83, complete: false },
  { day: "24", pct: 100, complete: true },
  { day: "25", pct: 52, complete: false },
  { day: "26", pct: 96, complete: false },
  { day: "27", pct: 100, complete: true },
  { day: "28", pct: 38, complete: false },
  { day: "29", pct: 71, complete: false },
  { day: "30", pct: 100, complete: true },
  { day: "01", pct: 59, complete: false, active: true },
] as const;

const JOURNAL_DEMO = [
  {
    kind: "daily",
    date: "Jun 20",
    mood: 4,
    title: "Shipped the small thing",
    body: "Closed the internship application loop. Walked 9k steps. One honest win beats ten imaginary plans.",
  },
  {
    kind: "weekly",
    date: "Jun 16",
    mood: 5,
    title: "Week 24 — momentum returning",
    body: "DSA streak is back. Fitness logging is consistent again. Next week: one project milestone, not three.",
  },
] as const;

function PreviewStepRing({
  pct,
  complete,
  hasData,
  delay = 0,
  size = "md",
}: {
  pct: number;
  complete: boolean;
  hasData: boolean;
  delay?: number;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? 22 : 28;
  const r = size === "sm" ? 8 : 10;
  const c = 2 * Math.PI * r;
  const targetDash = c * (clampPercent(pct) / 100);
  const strokeWidth = size === "sm" ? 2 : 2.5;

  const stroke = !hasData
    ? "var(--muted)"
    : complete
      ? "var(--gold)"
      : "color-mix(in oklab, var(--foreground) 55%, transparent)";

  return (
    <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="-rotate-90" aria-hidden>
      <circle
        cx={dim / 2}
        cy={dim / 2}
        r={r}
        stroke="var(--muted)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {hasData && (
        <motion.circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - targetDash }}
          transition={{ duration: 0.9, delay, ease }}
        />
      )}
    </svg>
  );
}

export function HomeDashboardPreview() {
  const rows = [
    { label: "Fitness journey", pct: 34, tone: "bg-gold/80" },
    { label: "DSA goal", pct: 58, tone: "bg-foreground/70" },
    { label: "Active projects", pct: 72, tone: "bg-sage/80" },
    { label: "Quarterly mission", pct: 41, tone: "bg-lavender/70" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Mochi size={48} mood="happy" />
        <div>
          <div className="font-display text-xl">Good morning</div>
          <div className="text-xs text-muted-foreground">Your journey at a glance</div>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        {rows.map((row, i) => (
          <div key={row.label}>
            <div className="flex items-baseline justify-between text-sm">
              <span>{row.label}</span>
              <span className="text-muted-foreground">{row.pct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className={`h-full rounded-full ${row.tone}`}
                initial={{ width: 0 }}
                animate={{ width: `${row.pct}%` }}
                transition={{ duration: 0.85, delay: 0.15 + i * 0.1, ease }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4">
        {[
          { label: "Streak", value: "12d" },
          { label: "Level", value: "7" },
          { label: "Today", value: "78%" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="rounded-lg border border-border bg-background/60 px-3 py-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 + i * 0.08, ease }}
          >
            <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              {s.label}
            </div>
            <div className="mt-0.5 font-display text-lg">{s.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function DsaActivityPreview({
  size = "full",
}: {
  /** full = product tour; card = spotlight cards (compact grid) */
  size?: "full" | "card";
}) {
  const isCard = size === "card";

  return (
    <div className={isCard ? "mx-auto w-full max-w-[200px]" : undefined}>
      <div
        className={
          isCard
            ? "mb-2.5 flex items-end justify-between gap-2"
            : "mb-4 flex flex-wrap items-end justify-between gap-3"
        }
      >
        <div>
          <div
            className={`flex items-center gap-1.5 uppercase tracking-[0.18em] text-muted-foreground ${
              isCard ? "text-[8px]" : "text-[10px]"
            }`}
          >
            <Code2 className={isCard ? "h-3 w-3" : "h-3.5 w-3.5"} />
            Activity
          </div>
          <div className={`mt-0.5 font-display ${isCard ? "text-sm" : "text-xl"}`}>
            Last 12 weeks
          </div>
        </div>
        {!isCard && (
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Solved
            </div>
            <div className="font-display text-2xl text-gradient-gold">47</div>
          </div>
        )}
      </div>
      <div
        className={
          isCard
            ? "grid grid-flow-col grid-rows-7 grid-cols-12 gap-[3px]"
            : "grid grid-cols-12 grid-flow-col grid-rows-7 gap-1.5"
        }
      >
        {DSA_DEMO.map((count, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.02 + i * 0.004, duration: 0.3, ease }}
            className={isCard ? "h-2 w-2 rounded-[2px]" : "aspect-square rounded-[3px]"}
            style={{ background: dsaCellBg(count) }}
          />
        ))}
      </div>
      <div
        className={`mt-2.5 flex items-center gap-2 uppercase tracking-[0.18em] text-muted-foreground ${
          isCard ? "text-[8px]" : "mt-4 gap-3 text-[10px]"
        }`}
      >
        Less
        {[0, 1, 2, 3].map((n) => (
          <span
            key={n}
            className={isCard ? "h-2 w-2 rounded-[2px]" : "h-3 w-3 rounded-[3px]"}
            style={{ background: dsaCellBg(n) }}
          />
        ))}
        More
      </div>
      {!isCard && (
        <motion.div
          className="mt-4 rounded-xl border border-border bg-background/60 px-4 py-3 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, ease }}
        >
          Solving ~0.8/day — goal around <span className="font-medium text-foreground">Aug 14</span>{" "}
          (54 days).
        </motion.div>
      )}
    </div>
  );
}

export function StepCalendarPreview({ size = "full" }: { size?: "full" | "card" }) {
  const isCard = size === "card";
  const days = isCard ? STEP_DEMO.slice(-14) : STEP_DEMO;

  return (
    <div>
      <div
        className={
          isCard
            ? "mb-2.5 flex items-baseline justify-between"
            : "mb-4 flex items-baseline justify-between"
        }
      >
        <div
          className={`flex items-center gap-1.5 uppercase tracking-[0.18em] text-muted-foreground ${
            isCard ? "text-[8px]" : "text-[10px]"
          }`}
        >
          <Footprints className={isCard ? "h-3 w-3" : "h-3.5 w-3.5"} />
          Step history
        </div>
        <div
          className={
            isCard ? "text-[8px] text-muted-foreground" : "text-[10px] text-muted-foreground"
          }
        >
          {isCard ? "14 days" : "Last 28 days"}
        </div>
      </div>
      <div className={isCard ? "grid grid-cols-7 gap-1" : "grid grid-cols-7 gap-2"}>
        {days.map((day, i) => {
          const hasData = !("empty" in day && day.empty);
          const isActive = "active" in day && day.active;
          return (
            <motion.div
              key={`${day.day}-${i}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.04 + i * 0.02, ease }}
              className={`flex flex-col items-center gap-0.5 rounded-md border text-[8px] ${
                isCard ? "px-0.5 py-1" : "gap-1 rounded-lg px-1 py-2 text-[9px]"
              } ${isActive ? "border-foreground bg-foreground/[0.04]" : "border-border"}`}
            >
              <PreviewStepRing
                pct={day.pct}
                complete={day.complete}
                hasData={hasData}
                delay={0.2 + i * 0.025}
                size={isCard ? "sm" : "md"}
              />
              <span className="text-muted-foreground">{day.day}</span>
            </motion.div>
          );
        })}
      </div>
      {!isCard && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            { label: "Today", value: "7,420", sub: "74% of 10k" },
            { label: "7-day avg", value: "9,180", sub: "On logged days" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-xl border border-border bg-background/60 px-4 py-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1, ease }}
            >
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-1 font-display text-2xl">{s.value}</div>
              <div className="text-[11px] text-muted-foreground">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export function JournalPreview({ size = "full" }: { size?: "full" | "card" }) {
  const isCard = size === "card";

  return (
    <div>
      <div
        className={
          isCard
            ? "mb-2.5 flex items-center justify-between"
            : "mb-4 flex items-center justify-between"
        }
      >
        <div className="flex items-center gap-2">
          <BookOpen className={`text-muted-foreground ${isCard ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
          <h3 className={`font-display ${isCard ? "text-sm" : "text-xl"}`}>Recent entries</h3>
        </div>
        {!isCard && (
          <span className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground">
            All
          </span>
        )}
      </div>
      <div className="space-y-3">
        {JOURNAL_DEMO.slice(0, isCard ? 1 : 2).map((e, i) => (
          <motion.div
            key={e.title}
            className={`rounded-2xl border border-border bg-background/50 ${
              isCard ? "p-3" : "p-4 md:p-5"
            }`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.15, ease }}
          >
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {e.kind}
              </span>
              <span className="text-xs text-muted-foreground">{e.date}</span>
              {!isCard && <span className="text-xs text-muted-foreground">· mood {e.mood}/5</span>}
            </div>
            <div className={`mt-2 font-display ${isCard ? "text-base" : "text-lg"}`}>{e.title}</div>
            <p
              className={`mt-2 leading-relaxed text-muted-foreground ${
                isCard ? "line-clamp-2 text-xs" : "text-sm"
              }`}
            >
              {e.body}
            </p>
          </motion.div>
        ))}
      </div>
      {!isCard && (
        <motion.div
          className="mt-4 rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, ease }}
        >
          Daily notes, weekly reviews, monthly intentions — all in one calm stream.
        </motion.div>
      )}
    </div>
  );
}
