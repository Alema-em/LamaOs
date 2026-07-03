import { createFileRoute, Link } from "@tanstack/react-router";
import { FeedbackForm } from "@/components/FeedbackForm";
import { LamaMark } from "@/components/LamaMark";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [{ title: "Feedback — LamaOS" }] }),
  component: FeedbackPage,
});

function FeedbackPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link to="/">
            <LamaMark size={36} nameClassName="text-lg" />
          </Link>
          <Link
            to="/auth"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Beta
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Send feedback</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          LamaOS is in free beta — your notes directly shape what we build next. Be honest: bugs,
          missing features, or things you love.
        </p>

        <div className="mt-10">
          <FeedbackForm source="feedback-page" />
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Prefer X?{" "}
          <a
            href="https://x.com/LamaOSapp"
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline-offset-4 hover:underline"
          >
            @LamaOSapp
          </a>
        </p>

        <div className="mt-10 border-t border-border pt-8">
          <Link to="/" className="text-sm text-muted-foreground transition hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
