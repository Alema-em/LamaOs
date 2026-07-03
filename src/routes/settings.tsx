import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useGame, type DashboardPrefs } from "@/hooks/use-game";
import { isDemoEmail } from "@/lib/demo-auth";
import { HOSTED_FREE_BETA } from "@/lib/app";
import { MODULE_META } from "@/lib/modules";
import { APP_TEMPLATES, type AppTemplateId } from "@/lib/templates";
import { PageHeader, Section, Panel } from "@/components/ui-kit";
import { FeedbackForm } from "@/components/FeedbackForm";
import { Download, Upload, RotateCcw, Sun, Moon, FlaskConical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — LamaOS" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { state, setProfile, setPrefs, toggleTheme, setTemplate, exportJson, importJson, reset, resetDemoState, previewMode } =
    useGame();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [demoUser, setDemoUser] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setDemoUser(isDemoEmail(data.user?.email));
    });
  }, []);

  function download() {
    const data = exportJson();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lamaos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importJson(String(reader.result));
        setImportMsg("Restored successfully.");
      } catch {
        setImportMsg("That file didn't look like a LamaOS backup.");
      }
    };
    reader.readAsText(file);
  }

  const sectionToggles: { key: keyof DashboardPrefs; label: string }[] = [
    { key: "showPinnedGoals", label: "Pinned goals" },
    { key: "showJourney", label: "Journey ring & breakdown" },
    { key: "showWeightTrend", label: "Weight trend" },
    { key: "showAchievements", label: "Recent achievements" },
    { key: "showWorkspaces", label: "Workspaces" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Operating system"
        title="Settings"
        subtitle="Profile, modules and data — synced to your account."
      />

      <Section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Profile" hint="You">
          <div className="space-y-4">
            <Field label="Name">
              <input
                value={state.name}
                onChange={(e) => setProfile({ name: e.target.value })}
                maxLength={40}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="North star">
              <input
                value={state.mainGoal}
                onChange={(e) => setProfile({ mainGoal: e.target.value })}
                maxLength={140}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="This week's focus">
              <input
                value={state.focus}
                onChange={(e) => setProfile({ focus: e.target.value })}
                maxLength={160}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Weekly target (actions)">
              <input
                type="number"
                min={1}
                max={50}
                value={state.weeklyTarget}
                onChange={(e) =>
                  setProfile({ weeklyTarget: Math.max(1, Math.min(50, +e.target.value || 1)) })
                }
                className="w-32 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Appearance" hint="Theme">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-sm hover:bg-foreground/[0.04]"
          >
            <span className="flex items-center gap-2">
              {state.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Switch to {state.theme === "dark" ? "light" : "dark"} mode
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              Currently {state.theme}
            </span>
          </button>
        </Panel>

        <Panel title="Template" hint="Look & feel">
          <p className="mb-4 text-sm text-muted-foreground">
            Pick a visual style. Classic is the original LamaOS. Dark mode still applies on top.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {APP_TEMPLATES.map((t) => {
              const active = state.template === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id as AppTemplateId)}
                  className={`rounded-xl border p-4 text-left transition ${active ? "border-foreground ring-1 ring-foreground" : "border-border hover:bg-foreground/[0.03]"}`}
                >
                  <div className="flex gap-2">
                    {t.swatch.map((color) => (
                      <span
                        key={color}
                        className="h-6 w-6 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 font-medium">{t.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{t.desc}</div>
                </button>
              );
            })}
          </div>
        </Panel>
      </Section>

      <Section>
        <Panel title="Sidebar modules" hint="Navigation">
          <p className="mb-4 text-sm text-muted-foreground">
            Turn modules on or off. Home, History, Achievements and Settings always stay visible.
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {MODULE_META.map((m) => (
              <label
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"
              >
                <span>{m.label}</span>
                <input
                  type="checkbox"
                  checked={state.prefs.modules[m.id]}
                  onChange={(e) =>
                    setPrefs({
                      modules: { ...state.prefs.modules, [m.id]: e.target.checked },
                    })
                  }
                  className="h-4 w-4 accent-foreground"
                />
              </label>
            ))}
          </div>
        </Panel>
      </Section>

      {(demoUser || previewMode) && (
        <Section>
          <Panel title="Demo account" hint="Preview">
            <p className="mb-4 text-sm text-muted-foreground">
              {previewMode
                ? "Browser preview — data stays on this device only. Reset to reload the latest sample template."
                : "Reset sample data to the latest demo template — useful when testing new features."}
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm("Reset demo data to the latest sample state?")) resetDemoState();
              }}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm hover:bg-foreground hover:text-background"
            >
              <FlaskConical className="h-4 w-4" /> Reset demo data
            </button>
          </Panel>
        </Section>
      )}

      <Section>
        <Panel title="Dashboard sections" hint="Customize home">
          <p className="mb-4 text-sm text-muted-foreground">
            Choose what appears when you open LamaOS.
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {sectionToggles.map((t) => (
              <label
                key={t.key}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"
              >
                <span>{t.label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(state.prefs[t.key])}
                  onChange={(e) =>
                    setPrefs({ [t.key]: e.target.checked } as Partial<DashboardPrefs>)
                  }
                  className="h-4 w-4 accent-foreground"
                />
              </label>
            ))}
          </div>
        </Panel>
      </Section>

      <Section className="pb-16">
        <Panel title="Data" hint={HOSTED_FREE_BETA ? "Synced to your account" : "Local only"}>
          <div className="grid gap-3 md:grid-cols-3">
            <button
              onClick={download}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm hover:bg-foreground hover:text-background"
            >
              <Download className="h-4 w-4" /> Export JSON
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm hover:bg-foreground hover:text-background"
            >
              <Upload className="h-4 w-4" /> Import JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => {
                if (confirm("Reset LamaOS to first-time state? This cannot be undone.")) reset();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-destructive/40 px-4 py-2.5 text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <RotateCcw className="h-4 w-4" /> Reset everything
            </button>
          </div>
          {importMsg && <div className="mt-3 text-xs text-muted-foreground">{importMsg}</div>}
        </Panel>
      </Section>

      <Section>
        <Panel title="Feedback" hint="Beta">
          <p className="mb-4 text-sm text-muted-foreground">
            What would make LamaOS worth opening every day? We read everything during beta.
          </p>
          <FeedbackForm source="settings" compact />
        </Panel>
      </Section>

      <p className="pb-16 text-center text-xs text-muted-foreground">
        <Link to="/privacy" className="transition hover:text-foreground">
          Privacy policy
        </Link>
        {" · "}
        <Link to="/feedback" className="transition hover:text-foreground">
          Feedback
        </Link>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
