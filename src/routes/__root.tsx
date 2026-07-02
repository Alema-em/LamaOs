import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import appCss from "../styles.css?url";
import { AppShell } from "@/components/AppShell";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { LandingPage } from "@/components/LandingPage";
import { GameProvider } from "@/hooks/use-game";
import { supabase } from "@/integrations/supabase/client";
import {
  exitLocalDemoPreview,
  isLocalDemoPreview,
  PREVIEW_CHANGED_EVENT,
} from "@/lib/demo-auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try refreshing or head home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LamaOS — Your personal operating system" },
      {
        name: "description",
        content:
          "A private dashboard for fitness, DSA, projects, internships, and goals — calm progress tracking for ambitious builders.",
      },
      { name: "author", content: "Alema Emran" },
      { property: "og:title", content: "LamaOS — Your personal operating system" },
      {
        property: "og:description",
        content:
          "Track fitness, career, and build goals in one calm dashboard. Private by default.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "LamaOS — Your personal operating system" },
      {
        name: "twitter:description",
        content:
          "Track fitness, career, and build goals in one calm dashboard. Private by default.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Quicksand:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const AUTH_PUBLIC_PATHS = new Set(["/auth", "/reset-password"]);

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const syncPreview = () => setPreviewMode(isLocalDemoPreview());
    syncPreview();
    window.addEventListener(PREVIEW_CHANGED_EVENT, syncPreview);
    return () => window.removeEventListener(PREVIEW_CHANGED_EVENT, syncPreview);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "SIGNED_OUT") {
        queryClient.clear();
        if (!isLocalDemoPreview()) {
          router.navigate({ to: "/auth", replace: true });
        }
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        exitLocalDemoPreview();
        router.invalidate();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  const hasAccess = Boolean(session) || previewMode;

  const isAuthPublic = AUTH_PUBLIC_PATHS.has(pathname);
  const showLanding = !hasAccess && pathname === "/";

  // Still checking session — render nothing to avoid a flash of /auth for signed-in users.
  if (!checked) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background" />
      </QueryClientProvider>
    );
  }

  // Marketing landing for signed-out visitors at /
  if (showLanding) {
    return (
      <QueryClientProvider client={queryClient}>
        <LandingPage />
      </QueryClientProvider>
    );
  }

  // Auth pages render without the shell.
  if (isAuthPublic) {
    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    );
  }

  // Protected pages: redirect to landing if no session or preview.
  if (!hasAccess) {
    if (typeof window !== "undefined") {
      router.navigate({ to: "/", replace: true });
    }
    return (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background" />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <AuthenticatedLayout />
      </GameProvider>
    </QueryClientProvider>
  );
}
