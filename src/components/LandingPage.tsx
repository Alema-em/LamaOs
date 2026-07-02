import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Briefcase,
  Check,
  Cloud,
  Code2,
  FolderKanban,
  Footprints,
  GraduationCap,
  Rocket,
  Shield,
  Sparkles,
  Target,
  UserPlus,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { startDemo } from "@/lib/demo-auth";
import { HOSTED_FREE_BETA } from "@/lib/app";
import { Mochi } from "@/components/Mochi";
import {
  DsaActivityPreview,
  HomeDashboardPreview,
  JournalPreview,
  StepCalendarPreview,
} from "@/components/landing/LandingPreviews";
import {
  AmbientGlow,
  Reveal,
  staggerContainer,
  staggerItem,
} from "@/components/landing/LandingMotion";
import { HeroMochi, HeroScrollCue } from "@/components/landing/HeroAtmosphere";

const MODULES = [
  {
    icon: Rocket,
    name: "Mission",
    desc: "Quarterly priorities and what actually matters this week.",
  },
  {
    icon: Activity,
    name: "Fitness",
    desc: "Weight, habits and daily targets — quiet consistency.",
  },
  { icon: Code2, name: "DSA", desc: "Practice log, topic coverage and streaks." },
  {
    icon: FolderKanban,
    name: "Projects",
    desc: "Ship side work with tasks, milestones and momentum.",
  },
  { icon: Target, name: "Goals", desc: "Long-horizon aims broken into milestones." },
  { icon: GraduationCap, name: "Career", desc: "Skills, resume, networking — one dashboard." },
  {
    icon: Briefcase,
    name: "Internships",
    desc: "Applications pipeline from applied to offer.",
  },
  { icon: BookOpen, name: "Journal", desc: "Reflect without leaving your operating system." },
] as const;

const AUDIENCES = [
  {
    icon: GraduationCap,
    title: "Students",
    desc: "Internship pipeline, DSA streaks and fitness — without five different apps.",
  },
  {
    icon: Code2,
    title: "Builders",
    desc: "Projects, goals and journal in one shell while you ship on the side.",
  },
  {
    icon: Target,
    title: "Ambitious generalists",
    desc: "Mission control for the life you're actually building — calm, not cluttered.",
  },
] as const;

const STEPS = [
  {
    icon: UserPlus,
    title: "Create a free account",
    desc: "Google or email — takes under a minute. No setup, no config.",
  },
  {
    icon: Rocket,
    title: "Pick your track",
    desc: "Student, builder, or full LamaOS. Turn modules on or off anytime.",
  },
  {
    icon: Sparkles,
    title: "Open it daily",
    desc: "Log a workout, a problem, an application — streaks and scores compound.",
  },
] as const;

const TRUST_SIGNALS = [
  { icon: Cloud, label: "Synced to your account" },
  { icon: Shield, label: "Private by default" },
  { icon: Sparkles, label: "Free during beta" },
] as const;

type CardPreviewProps = { size?: "full" | "card" };

const PRODUCT_CARDS: {
  icon: typeof Code2;
  title: string;
  desc: string;
  accent: string;
  Preview: ComponentType<CardPreviewProps>;
}[] = [
  {
    icon: Code2,
    title: "DSA activity calendar",
    desc: "Twelve weeks of practice at a glance. Gold intensity shows volume — streaks you can feel.",
    Preview: DsaActivityPreview,
    accent: "from-gold/8 to-transparent",
  },
  {
    icon: Footprints,
    title: "Step ring calendar",
    desc: "Twenty-eight mini rings — gold when you hit target. The same view you use every morning.",
    Preview: StepCalendarPreview,
    accent: "from-sage/10 to-transparent",
  },
  {
    icon: BookOpen,
    title: "Journal stream",
    desc: "Mood, kind and date on every entry. Reflect without switching apps.",
    Preview: JournalPreview,
    accent: "from-lavender/10 to-transparent",
  },
];

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function tryDemo() {
    setDemoBusy(true);
    try {
      const mode = await startDemo();
      if (mode === "preview") {
        navigate({ to: "/" });
        return;
      }
      navigate({ to: "/" });
    } finally {
      setDemoBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className={`sticky top-0 z-50 border-b transition-[background,border-color,backdrop-filter] duration-300 ${
          scrolled
            ? "border-border/80 bg-background/75 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="grid h-9 w-9 place-items-center rounded-lg bg-foreground text-background"
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <span className="font-display text-base leading-none">L</span>
            </motion.div>
            <span className="font-display text-xl">LamaOS</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#product"
              className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground sm:inline"
            >
              Product
            </a>
            <a
              href="#modules"
              className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground md:inline"
            >
              Modules
            </a>
            <a
              href="#how"
              className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground sm:inline"
            >
              How it works
            </a>
            <Link
              to="/auth"
              className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground sm:inline"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              search={{ signup: "1" }}
              className="rounded-md bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative min-h-[min(92vh,920px)] overflow-hidden">
          <AmbientGlow strongGrid />
          <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-6 pb-12 pt-10 md:pb-16 md:pt-14">
            <div className="mx-auto w-full max-w-5xl text-center">
              <HeroMochi />
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-xs text-muted-foreground backdrop-blur-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden />
                {HOSTED_FREE_BETA ? "Free during beta · Hosted app" : "Personal operating system"}
              </motion.div>

              <motion.h1
                className="mt-5 font-display text-[3rem] leading-[0.98] tracking-tight sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[7.25rem]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                Run your life
                <br />
                like a product.
              </motion.h1>

              <motion.p
                className="mx-auto mt-7 max-w-3xl font-display text-2xl italic leading-snug text-foreground/88 sm:text-3xl md:text-4xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              >
                Without the noise.
              </motion.p>

              <motion.p
                className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                A calm dashboard for students and builders — fitness, DSA, internships, projects
                and goals in one place. Sign up in seconds; we handle sync and hosting.
              </motion.p>

              <motion.div
                className="mt-11 flex flex-wrap items-center justify-center gap-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to="/auth"
                  search={{ signup: "1" }}
                  className="group inline-flex items-center gap-2 rounded-md bg-foreground px-7 py-3.5 text-sm font-medium text-background transition hover:opacity-90 md:text-base"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#product"
                  className="rounded-md border border-border bg-card/50 px-7 py-3.5 text-sm backdrop-blur-sm transition hover:bg-foreground/[0.04] md:text-base"
                >
                  See the product
                </a>
              </motion.div>

              <button
                type="button"
                disabled={demoBusy}
                onClick={() => void tryDemo()}
                className="mt-5 text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline disabled:opacity-50"
              >
                {demoBusy ? "Opening demo…" : "Or try the demo account"}
              </button>

              <motion.ul
                className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38, duration: 0.5 }}
              >
                {TRUST_SIGNALS.map(({ icon: Icon, label }) => (
                  <li key={label} className="inline-flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-foreground/50" aria-hidden />
                    {label}
                  </li>
                ))}
              </motion.ul>

              <HeroScrollCue />
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section id="how" className="relative border-t border-border bg-background">
          <div
            className="pointer-events-none absolute inset-0 bg-grid-strong opacity-[0.1]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
            <Reveal className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                How it works
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-tight md:text-5xl">
                Up and running in minutes.
              </h2>
            </Reveal>

            <motion.ol
              className="mt-12 grid gap-6 md:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
            >
              {STEPS.map(({ icon: Icon, title, desc }, i) => (
                <motion.li
                  key={title}
                  variants={staggerItem}
                  className="relative rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-sm font-medium text-background">
                      {i + 1}
                    </span>
                    <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-display text-xl">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </motion.li>
              ))}
            </motion.ol>

            <Reveal className="mt-20 text-center" delay={0.05}>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Built for
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
                People who take their life seriously.
              </h2>
            </Reveal>

            <motion.div
              className="mt-10 grid gap-4 md:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
            >
              {AUDIENCES.map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={staggerItem}
                  className="rounded-xl border border-border bg-card/80 px-5 py-5"
                >
                  <Icon className="h-4 w-4 text-gold" aria-hidden />
                  <div className="mt-3 font-medium">{title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Product cards */}
        <section id="product" className="relative border-t border-border bg-cream/35">
          <div
            className="pointer-events-none absolute inset-0 bg-grid opacity-[0.18]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-6 py-14 md:py-20">
            <Reveal className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Inside LamaOS
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-tight md:text-5xl">
                Crafted views, not generic widgets.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Real panels from the app — same grids, rings and calm typography you sign in to.
              </p>
            </Reveal>

            <motion.div
              className="mt-12 grid gap-5 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
            >
              {PRODUCT_CARDS.map((f) => {
                const Icon = f.icon;
                const Preview = f.Preview;
                return (
                  <motion.div
                    key={f.title}
                    variants={staggerItem}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 320, damping: 24 }}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
                  >
                    <div
                      className={`flex min-h-[200px] items-center justify-center border-b border-border bg-gradient-to-b px-4 py-6 ${f.accent}`}
                    >
                      <Preview size="card" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                        <h3 className="font-display text-lg">{f.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Home dashboard — full-width second row */}
            <Reveal className="mt-5" delay={0.1}>
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
              >
                <div className="flex min-h-[220px] items-center justify-center border-b border-border bg-gradient-to-b from-foreground/[0.03] to-transparent px-6 py-8 md:px-10">
                  <div className="w-full max-w-md">
                    <HomeDashboardPreview />
                  </div>
                </div>
                <div className="p-5 md:flex md:items-center md:justify-between md:gap-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-muted-foreground" aria-hidden />
                      <h3 className="font-display text-lg">Home dashboard</h3>
                    </div>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                      Journey progress, streak and today&apos;s score — your morning briefing in
                      one glance.
                    </p>
                  </div>
                  <Link
                    to="/auth"
                    search={{ signup: "1" }}
                    className="mt-4 inline-flex shrink-0 items-center gap-2 text-sm font-medium md:mt-0"
                  >
                    Open yours <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </section>

        {/* Modules */}
        <section id="modules" className="relative border-t border-border bg-background">
          <div
            className="pointer-events-none absolute inset-0 bg-grid-strong opacity-[0.12]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
            <Reveal>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Modules
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-tight md:text-5xl">
                Everything you care about, one shell.
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Eight modules. One calm interface. Turn on what matters to you.
              </p>
            </Reveal>

            <motion.div
              className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
            >
              {MODULES.map(({ icon: Icon, name, desc }) => (
                <motion.div
                  key={name}
                  variants={staggerItem}
                  whileHover={{
                    y: -3,
                    borderColor: "color-mix(in oklab, var(--foreground) 22%, transparent)",
                  }}
                  className="rounded-xl border border-border bg-card px-4 py-4 transition-shadow hover:shadow-soft"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <div className="mt-3 text-sm font-medium">{name}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-t border-border bg-cream/40">
          <div
            className="pointer-events-none absolute inset-0 bg-grid-strong opacity-[0.22]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-6 py-16 text-center md:py-24">
            <Reveal>
              <Mochi size={56} mood="celebrating" />
              <h2 className="mt-6 font-display text-3xl tracking-tight md:text-5xl">
                Ready when you are.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
                Free while we grow. Google or email — your data stays private and synced across
                devices.
              </p>
              <ul className="mx-auto mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                {["No credit card", "Google sign-in", "Export anytime"].map((item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-gold" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <motion.div className="mt-9" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/auth"
                  search={{ signup: "1" }}
                  className="inline-flex rounded-md bg-foreground px-7 py-3 text-sm font-medium text-background transition hover:opacity-90"
                >
                  Start free
                </Link>
              </motion.div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>LamaOS — hosted life OS for builders</span>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span>Free beta · Private · Synced</span>
            <Link to="/auth" className="transition hover:text-foreground">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
