import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Activity,
  Code2,
  Briefcase,
  FolderKanban,
  Target,
  Trophy,
  Moon,
  Sun,
  BookOpen,
  Settings as SettingsIcon,
  GraduationCap,
  Rocket,
  Menu,
  Check,
  LogOut,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { useGame, type SyncStatus } from "@/hooks/use-game";
import { routeModule } from "@/lib/modules";
import { HOSTED_FREE_BETA } from "@/lib/app";
import { Mochi } from "./Mochi";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/mission", label: "Mission", icon: Rocket },
  { to: "/fitness", label: "Fitness", icon: Activity },
  { to: "/dsa", label: "DSA", icon: Code2 },
  { to: "/internships", label: "Internships", icon: Briefcase },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/career", label: "Career", icon: GraduationCap },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/history", label: "History", icon: Clock },
  { to: "/achievements", label: "Achievements", icon: Trophy },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { state, lastSaved, hydrated, syncStatus, toggleTheme, signOut, previewMode } = useGame();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = NAV.filter((item) => {
    const mod = routeModule(item.to);
    if (!mod) return true;
    return state.prefs.modules[mod];
  });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <DesktopSidebar
        pathname={pathname}
        navItems={navItems}
        name={state.name}
        theme={state.theme}
        streak={state.streak}
        toggleTheme={toggleTheme}
        lastSaved={lastSaved}
        hydrated={hydrated}
        syncStatus={syncStatus}
        signOut={signOut}
      />

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card md:hidden"
            >
              <SidebarContents
                pathname={pathname}
                navItems={navItems}
                name={state.name}
                streak={state.streak}
                theme={state.theme}
                toggleTheme={toggleTheme}
                lastSaved={lastSaved}
                hydrated={hydrated}
                syncStatus={syncStatus}
                signOut={signOut}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex w-full flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md border border-border p-2"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="font-display text-lg">LamaOS</div>
            <SaveBadge lastSaved={lastSaved} hydrated={hydrated} syncStatus={syncStatus} compact />
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-md border border-border p-2"
            aria-label="Toggle theme"
          >
            {state.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 overflow-y-auto"
        >
          {previewMode && (
            <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-950 dark:text-amber-100">
              Demo preview — sample data stays in this browser only.{" "}
              <Link to="/settings" className="underline underline-offset-2">
                Reset demo data
              </Link>
            </div>
          )}
          {children}
        </motion.main>
      </div>
    </div>
  );
}

function DesktopSidebar({
  pathname,
  navItems,
  name,
  theme,
  streak,
  toggleTheme,
  lastSaved,
  hydrated,
  syncStatus,
  signOut,
}: {
  pathname: string;
  navItems: (typeof NAV)[number][];
  name: string;
  theme: "light" | "dark";
  streak: number;
  toggleTheme: () => void;
  lastSaved: number | null;
  hydrated: boolean;
  syncStatus: SyncStatus;
  signOut: () => Promise<void>;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
      <SidebarContents
        pathname={pathname}
        navItems={navItems}
        name={name}
        streak={streak}
        theme={theme}
        toggleTheme={toggleTheme}
        lastSaved={lastSaved}
        hydrated={hydrated}
        syncStatus={syncStatus}
        signOut={signOut}
      />
    </aside>
  );
}

function SidebarContents({
  pathname,
  navItems,
  name,
  streak,
  theme,
  toggleTheme,
  lastSaved,
  hydrated,
  syncStatus,
  signOut,
  onNavigate,
}: {
  pathname: string;
  navItems: (typeof NAV)[number][];
  name: string;
  streak: number;
  theme: "light" | "dark";
  toggleTheme: () => void;
  lastSaved: number | null;
  hydrated: boolean;
  syncStatus: SyncStatus;
  signOut: () => Promise<void>;
  onNavigate?: () => void;
}) {
  const todayItems = navItems.filter((i) => i.to === "/" || i.to === "/mission");
  const workspaceItems = navItems.filter((i) =>
    ["/fitness", "/dsa", "/internships", "/projects", "/career"].includes(i.to),
  );
  const visionItems = navItems.filter((i) =>
    ["/goals", "/journal", "/history", "/achievements", "/settings"].includes(i.to),
  );

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-foreground text-background">
            <span className="font-display text-lg leading-none">L</span>
          </div>
          <div>
            <div className="font-display text-lg leading-none">LamaOS</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground truncate max-w-[140px]">
              {name ? name : "Your private OS"}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        {todayItems.length > 0 && (
          <>
            <SectionLabel>Today</SectionLabel>
            {todayItems.map((i) => (
              <NavItem key={i.to} {...i} active={pathname === i.to} onNavigate={onNavigate} />
            ))}
          </>
        )}
        {workspaceItems.length > 0 && (
          <>
            <SectionLabel className="mt-4">Workspace</SectionLabel>
            {workspaceItems.map((i) => (
              <NavItem key={i.to} {...i} active={pathname === i.to} onNavigate={onNavigate} />
            ))}
          </>
        )}
        {visionItems.length > 0 && (
          <>
            <SectionLabel className="mt-4">Vision</SectionLabel>
            {visionItems.map((i) => (
              <NavItem key={i.to} {...i} active={pathname === i.to} onNavigate={onNavigate} />
            ))}
          </>
        )}
      </nav>

      <div className="m-3 rounded-xl border border-border bg-background/50 p-3">
        <div className="flex items-center gap-3">
          <Mochi size={36} mood={streak > 0 ? "happy" : "sleepy"} />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">Mochi</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {streak >= 7
                ? "Proud of your streak"
                : streak > 0
                  ? `${streak}d streak`
                  : "Resting nearby"}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-3 mb-2 px-1">
        <SaveBadge lastSaved={lastSaved} hydrated={hydrated} syncStatus={syncStatus} />
        {HOSTED_FREE_BETA && (
          <div className="mt-2 text-center text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Free beta
          </div>
        )}
      </div>

      <button
        onClick={toggleTheme}
        className="mx-3 mb-2 flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground"
      >
        <span className="flex items-center gap-2">
          {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </span>
        <span className="font-mono text-[10px] opacity-70">⌃T</span>
      </button>

      <button
        onClick={() => {
          void signOut();
        }}
        className="mx-3 mb-4 flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span>Sign out</span>
      </button>
    </>
  );
}

function SaveBadge({
  lastSaved,
  hydrated,
  syncStatus,
  compact,
}: {
  lastSaved: number | null;
  hydrated: boolean;
  syncStatus: SyncStatus;
  compact?: boolean;
}) {
  const [, force] = useState(0);
  useEffect(() => {
    const i = setInterval(() => force((x) => x + 1), 15000);
    return () => clearInterval(i);
  }, []);
  if (!hydrated || syncStatus === "loading") return null;
  const label =
    syncStatus === "saving"
      ? "Saving…"
      : syncStatus === "error"
        ? "Sync error — will retry"
        : lastSaved
          ? `Saved ${relTime(lastSaved)}`
          : "Ready";
  const icon =
    syncStatus === "saving" ? (
      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
    ) : syncStatus === "error" ? (
      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
    ) : (
      <Check className="h-3.5 w-3.5 text-sage" />
    );
  if (compact) {
    return (
      <span className="hidden items-center gap-1 rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground sm:inline-flex">
        {icon} {label}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-[11px] text-muted-foreground">
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}

function relTime(ts: number) {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
        active
          ? "bg-foreground/[0.06] text-foreground"
          : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r bg-accent"
        />
      )}
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
