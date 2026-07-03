import { createFileRoute, Link } from "@tanstack/react-router";
import { LamaMark } from "@/components/LamaMark";
import { getAppUrl } from "@/lib/app";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy — LamaOS" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const appUrl = getAppUrl();

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
          Legal
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Privacy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: July 2026</p>

        <div className="prose prose-sm mt-10 max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground [&_h2]:font-display [&_h2]:text-lg [&_h2]:text-foreground [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-foreground">
          <section>
            <h2>Who we are</h2>
            <p>
              LamaOS ({appUrl}) is a hosted life operating system for students and builders.
              During the free beta, LamaOS provides the app and secure cloud sync for your
              account.
            </p>
          </section>

          <section>
            <h2>What we collect</h2>
            <ul>
              <li>
                <strong>Account:</strong> email address and authentication data when you sign up
                (email/password or Google sign-in via Supabase Auth).
              </li>
              <li>
                <strong>App data:</strong> the goals, fitness logs, DSA entries, internship
                applications and other information you choose to save in LamaOS. This is stored as
                your private account state in our database.
              </li>
              <li>
                <strong>Usage:</strong> anonymous page views and performance data via Vercel
                Analytics to understand traffic and improve the product.
              </li>
            </ul>
          </section>

          <section>
            <h2>What we do not do</h2>
            <ul>
              <li>We do not sell your personal data.</li>
              <li>We do not let other users see your private state.</li>
              <li>We do not use your data to train third-party AI models.</li>
            </ul>
          </section>

          <section>
            <h2>How your data is protected</h2>
            <p>
              Your app data is stored in Supabase with row-level security: only you can read and
              write your own account while signed in. Connections use HTTPS. Demo preview mode
              keeps sample data in your browser only and does not sync to the cloud.
            </p>
          </section>

          <section>
            <h2>Third-party services</h2>
            <ul>
              <li>
                <strong>Supabase</strong> — authentication and database hosting.
              </li>
              <li>
                <strong>Vercel</strong> — website hosting and analytics.
              </li>
              <li>
                <strong>Google</strong> — optional sign-in if you choose Google auth.
              </li>
            </ul>
          </section>

          <section>
            <h2>Your choices</h2>
            <ul>
              <li>Export your data anytime from Settings as JSON.</li>
              <li>Delete your account by contacting us (self-serve delete coming soon).</li>
              <li>Use demo preview mode without creating an account.</li>
            </ul>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Privacy questions: message{" "}
              <a
                href="https://x.com/LamaOSapp"
                className="text-foreground underline-offset-4 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                @LamaOSapp on X
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <Link to="/" className="text-sm text-muted-foreground transition hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
