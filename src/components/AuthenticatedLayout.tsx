import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useGame } from "@/hooks/use-game";

export function AuthenticatedLayout() {
  const { state, hydrated } = useGame();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const onOnboarding = pathname === "/onboarding";

  useEffect(() => {
    if (!hydrated) return;
    if (!state.onboarded && !onOnboarding) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    if (state.onboarded && onOnboarding) {
      navigate({ to: "/", replace: true });
    }
  }, [hydrated, state.onboarded, onOnboarding, navigate]);

  if (!hydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!state.onboarded) {
    return <Outlet />;
  }

  if (onOnboarding) {
    return null;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
