import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startDemo } from "@/lib/demo-auth";
import { Mochi } from "@/components/Mochi";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — LamaOS" }] }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // If already signed in, leave the auth page.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        setMsg("Check your email to confirm your account, then sign in.");
        setMode("signin");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMsg("Reset link sent. Check your email.");
        setMode("signin");
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDemo() {
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      const mode = await startDemo();
      if (mode === "preview") {
        setMsg("Preview mode — sample data stays in this browser only.");
        navigate({ to: "/" });
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not open demo account.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setErr(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Google sign-in failed.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-foreground text-background">
            <span className="font-display text-lg leading-none">L</span>
          </div>
          <div>
            <div className="font-display text-2xl leading-none">LamaOS</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Your private operating system
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <Mochi size={40} mood="calm" />
            <div>
              <h1 className="font-display text-xl leading-tight">
                {mode === "signup"
                  ? "Create your account"
                  : mode === "forgot"
                    ? "Reset your password"
                    : "Welcome back"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {mode === "signup"
                  ? "Begin your private operating system."
                  : mode === "forgot"
                    ? "We'll email you a reset link."
                    : "Sign in to continue."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                autoComplete="email"
              />
            </div>
            {mode !== "forgot" && (
              <div>
                <label className="text-xs text-muted-foreground">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </div>
            )}

            {err && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {err}
              </div>
            )}
            {msg && (
              <div className="rounded-md border border-border bg-foreground/[0.04] px-3 py-2 text-xs text-muted-foreground">
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
            >
              {busy
                ? "Please wait…"
                : mode === "signup"
                  ? "Create account"
                  : mode === "forgot"
                    ? "Send reset link"
                    : "Sign in"}
            </button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or{" "}
                <div className="h-px flex-1 bg-border" />
              </div>
              <button
                onClick={handleGoogle}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm transition hover:bg-foreground/[0.04] disabled:opacity-50"
              >
                <GoogleIcon /> Continue with Google
              </button>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => void handleDemo()}
                  disabled={busy}
                  className="mt-2 w-full rounded-md border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
                >
                  Try demo account
                </button>
              )}
            </>
          )}

          <div className="mt-5 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
            {mode === "signin" && (
              <>
                <button
                  onClick={() => {
                    setErr(null);
                    setMsg(null);
                    setMode("signup");
                  }}
                  className="hover:text-foreground"
                >
                  Create account
                </button>
                <button
                  onClick={() => {
                    setErr(null);
                    setMsg(null);
                    setMode("forgot");
                  }}
                  className="hover:text-foreground"
                >
                  Forgot password?
                </button>
              </>
            )}
            {mode === "signup" && (
              <button
                onClick={() => {
                  setErr(null);
                  setMsg(null);
                  setMode("signin");
                }}
                className="hover:text-foreground"
              >
                Already have an account? Sign in
              </button>
            )}
            {mode === "forgot" && (
              <button
                onClick={() => {
                  setErr(null);
                  setMsg(null);
                  setMode("signin");
                }}
                className="hover:text-foreground"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Your data is stored privately. Only you can read it.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.5 29 4.5 24 4.5 16.3 4.5 9.7 9 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5.1 0 9.7-1.9 13.3-5.1l-6.1-5.2c-2 1.4-4.4 2.3-7.2 2.3-5.3 0-9.7-3-11.3-7.4l-6.5 5C9.5 38.9 16.2 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.4l6.1 5.2C40.7 35.8 43.5 30.3 43.5 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
