import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease },
  },
};

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function AmbientGlow({ strongGrid = false }: { strongGrid?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -right-24 top-8 h-80 w-80 rounded-full bg-gold/10 blur-3xl"
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.06, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-lavender/10 blur-3xl"
        animate={{ opacity: [0.25, 0.45, 0.25], scale: [1.04, 1, 1.04] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-64 w-[min(100%,720px)] -translate-x-1/2 rounded-full bg-sage/8 blur-3xl"
        animate={{ opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className={
          strongGrid ? "absolute inset-0 bg-grid-strong" : "absolute inset-0 bg-grid opacity-[0.35]"
        }
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_85%_at_50%_42%,transparent_25%,var(--background)_78%)]" />
    </div>
  );
}

export function AppWindow({
  title,
  eyebrow,
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-soft",
        className,
      )}
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease }}
    >
      <div className="flex items-center gap-2 border-b border-border bg-background/50 px-4 py-3 backdrop-blur-sm">
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/10" />
        <div className="ml-2 flex flex-col">
          {eyebrow && (
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </span>
          )}
          <span className="text-[11px] font-medium text-foreground/80">{title}</span>
        </div>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </motion.div>
  );
}
