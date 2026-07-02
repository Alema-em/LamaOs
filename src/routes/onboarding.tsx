import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Mochi } from "@/components/Mochi";
import {
  LAMA_MODULE_IDS,
  MODULE_META,
  mergeModuleFlags,
  PRESET_MODULES,
  type LamaModuleId,
  type OnboardingPreset,
} from "@/lib/modules";
import { useGame } from "@/hooks/use-game";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — LamaOS" }] }),
  component: OnboardingPage,
});

const PRESETS: {
  id: OnboardingPreset;
  title: string;
  desc: string;
}[] = [
  {
    id: "full",
    title: "Full LamaOS",
    desc: "Every module — fitness, DSA, career, projects and more.",
  },
  {
    id: "student",
    title: "Student track",
    desc: "Internships, DSA, fitness, goals — skip heavy project tooling.",
  },
  {
    id: "builder",
    title: "Builder track",
    desc: "Projects, goals, journal — lean shell for shipping.",
  },
  {
    id: "custom",
    title: "Pick modules",
    desc: "Choose exactly what you want in the sidebar.",
  },
];

function OnboardingPage() {
  const { completeOnboarding } = useGame();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [mainGoal, setMainGoal] = useState("");
  const [preset, setPreset] = useState<OnboardingPreset>("full");
  const [customModules, setCustomModules] = useState({ ...PRESET_MODULES.full });

  const steps = ["name", "structure", preset === "custom" ? "modules" : null, "goal"].filter(
    Boolean,
  ) as string[];
  const stepKey = steps[step];
  const isLast = step === steps.length - 1;

  function toggleModule(id: LamaModuleId) {
    setCustomModules((m) => ({ ...m, [id]: !m[id] }));
  }

  function finish() {
    const modules =
      preset === "custom"
        ? mergeModuleFlags("custom", customModules)
        : mergeModuleFlags(preset);
    if (!LAMA_MODULE_IDS.some((id) => modules[id])) {
      return;
    }
    completeOnboarding({
      name: name.trim() || "Friend",
      mainGoal: mainGoal.trim(),
      preset,
      modules,
    });
    navigate({ to: "/" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid-strong opacity-[0.35]" aria-hidden />
      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border bg-card/90 p-6 shadow-soft backdrop-blur-sm md:p-10"
        >
          <div className="mb-6 flex items-center gap-3">
            <Mochi size={48} mood="happy" />
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Welcome · Step {step + 1} of {steps.length}
              </div>
              <div className="font-display text-2xl">Set up your LamaOS</div>
            </div>
          </div>

          <div className="mb-6 h-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-foreground/80"
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>

          {stepKey === "name" && (
            <div>
              <h2 className="font-display text-3xl leading-tight">What should we call you?</h2>
              <p className="mt-2 text-sm text-muted-foreground">Mochi will greet you on the home screen.</p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="Your name"
                className="mt-5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
              />
            </div>
          )}

          {stepKey === "structure" && (
            <div>
              <h2 className="font-display text-3xl leading-tight">How do you want to start?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Pick a default layout. You can change modules anytime in Settings.
              </p>
              <div className="mt-5 grid gap-3">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreset(p.id)}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      preset === p.id
                        ? "border-foreground bg-foreground/[0.04]"
                        : "border-border hover:border-foreground/25"
                    }`}
                  >
                    <div className="text-sm font-medium">{p.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {stepKey === "modules" && (
            <div>
              <h2 className="font-display text-3xl leading-tight">Choose your modules</h2>
              <p className="mt-2 text-sm text-muted-foreground">Only selected areas appear in the sidebar.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {MODULE_META.map((m) => {
                  const Icon = m.icon;
                  const on = customModules[m.id];
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleModule(m.id)}
                      className={`flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${
                        on ? "border-foreground bg-foreground/[0.04]" : "border-border opacity-70"
                      }`}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{m.label}</div>
                        <div className="text-[11px] text-muted-foreground">{m.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {stepKey === "goal" && (
            <div>
              <h2 className="font-display text-3xl leading-tight">Your north star</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Optional — one line for what you&apos;re building toward.
              </p>
              <input
                value={mainGoal}
                onChange={(e) => setMainGoal(e.target.value)}
                maxLength={140}
                placeholder="e.g. Land a SWE internship and ship my side project"
                className="mt-5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
              />
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Back
              </button>
            )}
            {!isLast ? (
              <button
                type="button"
                disabled={stepKey === "name" && !name.trim()}
                onClick={() => setStep((s) => s + 1)}
                className="rounded-md bg-foreground px-5 py-2 text-sm text-background hover:opacity-90 disabled:opacity-40"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={stepKey === "name" && !name.trim()}
                onClick={finish}
                className="rounded-md bg-foreground px-5 py-2 text-sm text-background hover:opacity-90 disabled:opacity-40"
              >
                Enter LamaOS
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                completeOnboarding({
                  name: name.trim() || "Friend",
                  mainGoal: "",
                  preset: "full",
                  modules: mergeModuleFlags("full"),
                });
                navigate({ to: "/" });
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
