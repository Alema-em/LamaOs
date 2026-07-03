import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const FEEDBACK_CATEGORIES = [
  { value: "idea", label: "Feature idea" },
  { value: "bug", label: "Bug or issue" },
  { value: "praise", label: "Something I like" },
  { value: "other", label: "Other" },
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]["value"];

type FeedbackFormProps = {
  source: string;
  compact?: boolean;
};

export function FeedbackForm({ source, compact = false }: FeedbackFormProps) {
  const [category, setCategory] = useState<FeedbackCategory>("idea");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(Boolean(data.user));
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return;

    setErrorMsg(null);
    setStatus("idle");
    setBusy(true);

    try {
      const trimmed = message.trim();
      if (trimmed.length < 10) {
        throw new Error("Please write at least 10 characters.");
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      const row = {
        user_id: user?.id ?? null,
        email: user?.email ?? (email.trim() || null),
        category,
        message: trimmed,
        source,
      };

      const { error } = await supabase.from("feedback").insert(row);
      if (error) throw error;

      setMessage("");
      if (!user) setEmail("");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Could not send feedback.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "success") {
    return (
      <div
        className={`rounded-2xl border border-border bg-card text-center shadow-soft ${compact ? "p-6" : "p-10"}`}
      >
        <div className="font-display text-2xl">Thank you</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Your feedback helps shape LamaOS during beta. We read every message.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={`rounded-2xl border border-border bg-card shadow-soft ${compact ? "p-5" : "p-6 md:p-8"}`}
    >
      <div className="grid gap-4">
        <div>
          <label className="text-xs text-muted-foreground">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {FEEDBACK_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Your feedback</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={10}
            maxLength={2000}
            rows={compact ? 4 : 6}
            placeholder="What's working? What's missing? What would make you open LamaOS daily?"
            className="mt-1 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <div className="mt-1 text-right text-[10px] text-muted-foreground">
            {message.length}/2000
          </div>
        </div>

        {!signedIn && (
          <div>
            <label className="text-xs text-muted-foreground">
              Email <span className="text-muted-foreground/70">(optional — if you want a reply)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              autoComplete="email"
            />
          </div>
        )}

        {/* Honeypot — hidden from humans */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
        />

        {errorMsg && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {errorMsg}
            {errorMsg.includes("relation") || errorMsg.includes("feedback") ? (
              <span className="mt-1 block text-muted-foreground">
                If this persists, the feedback table may not be migrated yet on production Supabase.
              </span>
            ) : null}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || message.trim().length < 10}
          className="rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send feedback"}
        </button>
      </div>
    </form>
  );
}
