import { motion } from "framer-motion";
import type { ContributionCell } from "@/lib/dates";
import { chunkContributionWeeks } from "@/lib/dates";

function cellBg(count: number) {
  if (count === 0) return "color-mix(in oklab, var(--foreground) 5%, transparent)";
  return `color-mix(in oklab, var(--gold) ${30 + count * 22}%, transparent)`;
}

type DsaActivityGridProps = {
  cells: ContributionCell[];
  animate?: boolean;
  compact?: boolean;
};

export function DsaActivityGrid({ cells, animate = false, compact = false }: DsaActivityGridProps) {
  const weeks = chunkContributionWeeks(cells);
  const gap = compact ? "gap-[3px]" : "gap-1.5";
  const rounded = compact ? "rounded-[2px]" : "rounded-[3px]";

  return (
    <div className={`flex w-full ${gap}`}>
      {weeks.map((week, wi) => (
        <div key={wi} className={`flex min-w-0 flex-1 flex-col ${gap}`}>
          {week.map((d, di) => {
            const i = wi * 7 + di;
            const style = { background: cellBg(d.count) };
            const title = `${d.key}: ${d.count}`;
            const className = `aspect-square w-full ${rounded}`;

            if (animate) {
              return (
                <motion.div
                  key={d.key}
                  title={title}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.004 }}
                  className={className}
                  style={style}
                />
              );
            }

            return (
              <div key={d.key} title={title} className={className} style={style} />
            );
          })}
        </div>
      ))}
    </div>
  );
}
