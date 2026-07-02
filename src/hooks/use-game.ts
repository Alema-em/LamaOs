import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  createContext,
  useContext,
  type ReactNode,
  createElement,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { clampPercent } from "@/lib/progress";
import {
  isDemoEmail,
  isLocalDemoPreview,
  exitLocalDemoPreview,
  PREVIEW_CHANGED_EVENT,
  PREVIEW_STATE_KEY,
} from "@/lib/demo-auth";
import {
  createDemoState,
  demoSeedNeedsRefresh,
  isBareAccount,
} from "@/lib/demo-state";
import { ALL_MODULES_ON, type ModuleFlags, type OnboardingPreset } from "@/lib/modules";
import type { CareerSkillCategory } from "@/lib/career";
import { DEFAULT_TEMPLATE, isAppTemplateId, type AppTemplateId } from "@/lib/templates";
import { getEarnedAchievementIds } from "@/lib/achievements";

export type SyncStatus = "idle" | "loading" | "saving" | "saved" | "error" | "offline";

export type ApplicationStatus = "applied" | "interview" | "offer" | "rejected";

export interface WeightEntry {
  date: string;
  weight: number;
}
export interface Workout {
  id: string;
  date: string;
  type: string;
  minutes: number;
}
export interface DsaProblem {
  id: string;
  date: string;
  title: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}
export interface Application {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  date: string;
  note?: string;
}
export interface Milestone {
  id: string;
  title: string;
  done: boolean;
  date?: string;
  category?: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  done: boolean;
  date?: string;
}
export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  targetDate?: string;
  createdAt: string;
  archived: boolean;
  pinned: boolean;
  manualProgress: number;
  milestones: GoalMilestone[];
}

export interface JournalEntry {
  id: string;
  date: string;
  kind: "daily" | "weekly" | "monthly";
  title?: string;
  body: string;
  mood?: 1 | 2 | 3 | 4 | 5;
}

// === Fitness ===
export interface DailyLog {
  date: string;
  weight?: number;
  calories?: number;
  protein?: number;
  water?: number;
  steps?: number;
  sleep?: number;
  gymMin?: number;
  walkMin?: number;
}
export interface FitnessTargets {
  calories: number;
  protein: number;
  water: number;
  steps: number;
  sleep: number;
  gymMinWeekly: number;
  walkMinDaily: number;
}
export const DEFAULT_FITNESS_TARGETS: FitnessTargets = {
  calories: 2000,
  protein: 140,
  water: 3,
  steps: 10000,
  sleep: 7.5,
  gymMinWeekly: 180,
  walkMinDaily: 30,
};

// === Projects ===
export type ProjectStatus = "planning" | "active" | "paused" | "shipped" | "archived";
export type Priority = "low" | "med" | "high";
export interface ProjectTask {
  id: string;
  title: string;
  done: boolean;
  due?: string;
  priority: Priority;
  createdAt: string;
  doneAt?: string;
  status?: "todo" | "doing" | "done";
}
export interface ProjectMilestone {
  id: string;
  title: string;
  done: boolean;
  date?: string;
}
export interface ProjectNote {
  id: string;
  date: string;
  body: string;
}
export interface ProjectLink {
  id: string;
  label: string;
  url: string;
}
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  startDate?: string;
  deadline?: string;
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  notes: ProjectNote[];
  links: ProjectLink[];
  pinned: boolean;
  createdAt: string;
}

// === Career ===
export interface CareerSkill {
  id: string;
  name: string;
  level: number;
  category: CareerSkillCategory;
}
export interface CareerCheck {
  id: string;
  text: string;
  done: boolean;
}
export interface CareerPresence {
  resumeFresh: boolean;
  linkedinUpdated: boolean;
  githubActive: boolean;
  portfolioLive: boolean;
}
export interface CareerState {
  resumeUpdates: number;
  linkedinScore: number;
  githubScore: number;
  technicalScore: number;
  networkingContacts: number;
  interviewPrepHours: number;
  presence: CareerPresence;
  skills: CareerSkill[];
  checklist: CareerCheck[];
}
export const DEFAULT_CAREER_PRESENCE: CareerPresence = {
  resumeFresh: false,
  linkedinUpdated: false,
  githubActive: false,
  portfolioLive: false,
};
export const DEFAULT_CAREER: CareerState = {
  resumeUpdates: 0,
  linkedinScore: 0,
  githubScore: 0,
  technicalScore: 0,
  networkingContacts: 0,
  interviewPrepHours: 0,
  presence: { ...DEFAULT_CAREER_PRESENCE },
  skills: [],
  checklist: [],
};

// === Weekly review ===
export interface WeeklyReview {
  id: string;
  weekOf: string;
  wins: string[];
  misses: string[];
  bestHabit?: string;
  worstHabit?: string;
  grade: string;
  notes: string;
  nextWeekPlan: string;
}

export interface DashboardPrefs {
  showPinnedGoals: boolean;
  showJourney: boolean;
  showBreakdown: boolean;
  showWeightTrend: boolean;
  showAchievements: boolean;
  showWorkspaces: boolean;
  showToday: boolean;
  showMission: boolean;
  sectionOrder: string[];
  modules: ModuleFlags;
  /** Bumped when demo seed template changes — demo accounts auto-refresh. */
  demoSeedVersion?: number;
}

export interface OnboardingPayload {
  name: string;
  mainGoal: string;
  preset: OnboardingPreset;
  modules: ModuleFlags;
}

export interface GameState {
  name: string;
  focus: string;
  mainGoal: string;
  theme: "light" | "dark";
  template: AppTemplateId;
  onboarded: boolean;
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  lastActive: string;
  weeklyTarget: number;
  weeklyDone: number;
  weekAnchor: string;
  fitness: {
    current: number;
    goal: number;
    start: number;
    history: WeightEntry[];
    workouts: Workout[];
    daily: DailyLog[];
    targets: FitnessTargets;
  };
  dsa: { goal: number; problems: DsaProblem[] };
  internships: { goal: number; applications: Application[] };
  projects: Project[];
  career: CareerState;
  weeklyReviews: WeeklyReview[];
  achievements: string[];
  goals: Goal[];
  goalCategories: string[];
  journal: JournalEntry[];
  prefs: DashboardPrefs;
  // Legacy fields preserved for backwards-compat with achievements / migration:
  brandforge: {
    milestones: Milestone[];
    tasks: {
      id: string;
      title: string;
      priority: "low" | "med" | "high";
      due?: string;
      done: boolean;
      project: "brandforge" | "axiomera";
    }[];
  };
  axiomera: {
    tasks: {
      id: string;
      title: string;
      priority: "low" | "med" | "high";
      due?: string;
      done: boolean;
      project: "brandforge" | "axiomera";
    }[];
  };
}

const STORAGE_KEY = "lamaos-v3";
const LEGACY_KEY = "lamaos-v2";

export function today() {
  return new Date().toISOString().slice(0, 10);
}
function id() {
  return Math.random().toString(36).slice(2, 10);
}
function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  return x.toISOString().slice(0, 10);
}

export const DEFAULT_PREFS: DashboardPrefs = {
  showPinnedGoals: true,
  showJourney: true,
  showBreakdown: true,
  showWeightTrend: true,
  showAchievements: true,
  showWorkspaces: true,
  showToday: true,
  showMission: true,
  sectionOrder: [
    "today",
    "mission",
    "pinnedGoals",
    "journey",
    "weightTrend",
    "achievements",
    "workspaces",
  ],
  modules: { ...ALL_MODULES_ON },
};

export const EMPTY_STATE: GameState = {
  name: "",
  focus: "",
  mainGoal: "",
  theme: "light",
  template: DEFAULT_TEMPLATE,
  onboarded: false,
  level: 1,
  xp: 0,
  totalXp: 0,
  streak: 0,
  lastActive: "",
  weeklyTarget: 7,
  weeklyDone: 0,
  weekAnchor: startOfWeek(),
  fitness: {
    current: 0,
    goal: 0,
    start: 0,
    history: [],
    workouts: [],
    daily: [],
    targets: DEFAULT_FITNESS_TARGETS,
  },
  dsa: { goal: 0, problems: [] },
  internships: { goal: 0, applications: [] },
  projects: [],
  career: DEFAULT_CAREER,
  weeklyReviews: [],
  achievements: [],
  goals: [],
  goalCategories: ["Career", "Fitness", "Craft", "Studio", "Mind"],
  journal: [],
  prefs: DEFAULT_PREFS,
  brandforge: { milestones: [], tasks: [] },
  axiomera: { tasks: [] },
};

export function xpForLevel(level: number) {
  return Math.floor(100 * Math.pow(level, 1.35));
}

type LegacyWorkspaceTask = Partial<
  Pick<GameState["brandforge"]["tasks"][number], "id" | "title" | "done" | "due" | "priority">
>;

type LegacySavedSnapshot = Partial<Omit<GameState, "brandforge" | "axiomera">> & {
  brandforge?: {
    milestones?: Array<Partial<Milestone>>;
    tasks?: LegacyWorkspaceTask[];
  };
  axiomera?: {
    tasks?: LegacyWorkspaceTask[];
  };
  projects?: Project[];
};

function migrateLegacy(saved: unknown): unknown {
  // If has brandforge/axiomera but no projects[], lift them into projects.
  if (!saved || typeof saved !== "object") return saved;
  const snapshot = saved as LegacySavedSnapshot;
  if (snapshot.projects?.length) return saved;
  const projects: Project[] = [];
  const now = today();
  if (snapshot.brandforge?.milestones?.length || snapshot.brandforge?.tasks?.length) {
    projects.push({
      id: id(),
      name: "BrandForge",
      description: "Your studio project.",
      status: "active",
      priority: "high",
      tasks: (snapshot.brandforge.tasks || []).map((t: LegacyWorkspaceTask) => ({
        id: t.id || id(),
        title: t.title,
        done: !!t.done,
        due: t.due,
        priority: t.priority || "med",
        createdAt: now,
        status: t.done ? "done" : "todo",
      })) as ProjectTask[],
      milestones: (snapshot.brandforge.milestones || []).map((m: Partial<Milestone>) => ({
        id: m.id || id(),
        title: m.title,
        done: !!m.done,
        date: m.date,
      })) as ProjectMilestone[],
      notes: [],
      links: [],
      pinned: true,
      createdAt: now,
    });
  }
  if (snapshot.axiomera?.tasks?.length) {
    projects.push({
      id: id(),
      name: "Axiomera",
      description: "Research & systems work.",
      status: "active",
      priority: "med",
      tasks: (snapshot.axiomera.tasks || []).map((t: LegacyWorkspaceTask) => ({
        id: t.id || id(),
        title: t.title,
        done: !!t.done,
        due: t.due,
        priority: t.priority || "med",
        createdAt: now,
        status: t.done ? "done" : "todo",
      })) as ProjectTask[],
      milestones: [],
      notes: [],
      links: [],
      pinned: false,
      createdAt: now,
    });
  }
  return { ...snapshot, projects };
}

function mergeState(saved: unknown): GameState {
  if (!saved || typeof saved !== "object") return EMPTY_STATE;
  const migrated = migrateLegacy(saved) as Partial<GameState>;
  return {
    ...EMPTY_STATE,
    ...migrated,
    fitness: {
      ...EMPTY_STATE.fitness,
      ...(migrated.fitness || {}),
      targets: { ...DEFAULT_FITNESS_TARGETS, ...(migrated.fitness?.targets || {}) },
      daily: Array.isArray(migrated.fitness?.daily) ? migrated.fitness.daily : [],
    },
    dsa: { ...EMPTY_STATE.dsa, ...(migrated.dsa || {}) },
    internships: { ...EMPTY_STATE.internships, ...(migrated.internships || {}) },
    brandforge: { ...EMPTY_STATE.brandforge, ...(migrated.brandforge || {}) },
    axiomera: { ...EMPTY_STATE.axiomera, ...(migrated.axiomera || {}) },
    career: mergeCareerState(migrated.career),
    prefs: {
      ...DEFAULT_PREFS,
      ...(migrated.prefs || {}),
      modules: { ...ALL_MODULES_ON, ...(migrated.prefs?.modules || {}) },
    },
    projects: Array.isArray(migrated.projects) ? migrated.projects : [],
    weeklyReviews: Array.isArray(migrated.weeklyReviews) ? migrated.weeklyReviews : [],
    goalCategories: migrated.goalCategories?.length
      ? migrated.goalCategories
      : EMPTY_STATE.goalCategories,
    goals: Array.isArray(migrated.goals) ? migrated.goals : [],
    journal: Array.isArray(migrated.journal) ? migrated.journal : [],
    achievements: Array.isArray(migrated.achievements) ? migrated.achievements : [],
    template: isAppTemplateId(migrated.template) ? migrated.template : DEFAULT_TEMPLATE,
  };
}

function mergeCareerState(raw: Partial<CareerState> | undefined): CareerState {
  const c = { ...DEFAULT_CAREER, ...(raw || {}) };
  const presence = { ...DEFAULT_CAREER_PRESENCE, ...(raw?.presence || {}) };
  if (!raw?.presence) {
    if (c.resumeUpdates > 0) presence.resumeFresh = true;
    if (c.linkedinScore >= 50) presence.linkedinUpdated = true;
    if (c.githubScore >= 50) presence.githubActive = true;
  }
  const skills = (Array.isArray(c.skills) ? c.skills : []).map((s) => ({
    ...s,
    category: s.category || "other",
  }));
  return { ...c, presence, skills };
}

function useGameStore() {
  // CRITICAL: SSR-safe — always start with EMPTY_STATE so server & first client render match.
  const [state, setState] = useState<GameState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(true); // first state set after load shouldn't trigger a save
  const stateRef = useRef(state);
  stateRef.current = state;

  const persistState = useCallback(async (uid: string, snapshot: GameState) => {
    const { error } = await supabase
      .from("user_state")
      .upsert({ user_id: uid, state: snapshot as never }, { onConflict: "user_id" });
    if (error) throw error;
    setLastSaved(Date.now());
    setSyncStatus("saved");
  }, []);

  const flushSave = useCallback(async () => {
    if (!hydrated || !userId) return;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    setSyncStatus("saving");
    try {
      await persistState(userId, stateRef.current);
    } catch (e) {
      console.error("[useGame] flush save failed", e);
      setSyncStatus("error");
      throw e;
    }
  }, [hydrated, userId, persistState]);

  useEffect(() => {
    const syncPreview = () => setPreviewMode(isLocalDemoPreview());
    syncPreview();
    window.addEventListener(PREVIEW_CHANGED_EVENT, syncPreview);
    return () => window.removeEventListener(PREVIEW_CHANGED_EVENT, syncPreview);
  }, []);

  useEffect(() => {
    if (!previewMode) return;
    let cancelled = false;
    setSyncStatus("loading");
    try {
      let next = createDemoState();
      const raw = localStorage.getItem(PREVIEW_STATE_KEY);
      if (raw) {
        next = mergeState(JSON.parse(raw));
      }
      if (demoSeedNeedsRefresh(next)) {
        next = createDemoState();
      }
      if (cancelled) return;
      skipNextSave.current = true;
      setUserId(null);
      setState(next);
      setHydrated(true);
      setLastSaved(Date.now());
      setSyncStatus("saved");
    } catch (e) {
      console.error("[useGame] preview load failed", e);
      if (cancelled) return;
      skipNextSave.current = true;
      setState(createDemoState());
      setHydrated(true);
      setSyncStatus("error");
    }
    return () => {
      cancelled = true;
    };
  }, [previewMode]);

  // Load from cloud whenever the auth session changes.
  useEffect(() => {
    let cancelled = false;

    async function loadForUser(uid: string | null, email: string | null) {
      if (cancelled) return;
      setUserId(uid);
      if (!uid) {
        if (isLocalDemoPreview()) return;
        skipNextSave.current = true;
        setState(EMPTY_STATE);
        setHydrated(true);
        setSyncStatus("idle");
        return;
      }
      setSyncStatus("loading");
      try {
        const { data, error } = await supabase
          .from("user_state")
          .select("state, updated_at")
          .eq("user_id", uid)
          .maybeSingle();
        if (cancelled) return;
        if (error) throw error;
        skipNextSave.current = true;
        let next =
          data?.state && typeof data.state === "object" && Object.keys(data.state).length > 0
            ? mergeState(data.state)
            : EMPTY_STATE;
        if (isDemoEmail(email) && (isBareAccount(next) || demoSeedNeedsRefresh(next))) {
          next = createDemoState();
        }
        setState(next);
        setHydrated(true);
        setLastSaved(data?.updated_at ? new Date(data.updated_at).getTime() : null);
        setSyncStatus("saved");
      } catch (e) {
        console.error("[useGame] load failed", e);
        if (cancelled) return;
        setHydrated(true);
        setSyncStatus("error");
      }
    }

    // Initial fetch
    supabase.auth.getSession().then(({ data }) => {
      loadForUser(data.session?.user.id ?? null, data.session?.user.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;
      loadForUser(session?.user.id ?? null, session?.user.email ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Debounced persist to Supabase whenever state changes (after first load).
  useEffect(() => {
    if (!hydrated || previewMode) return;
    if (!userId) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    setSyncStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      saveTimer.current = null;
      try {
        await persistState(userId, stateRef.current);
      } catch (e) {
        console.error("[useGame] save failed", e);
        setSyncStatus("error");
      }
    }, 600);
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [state, hydrated, userId, persistState]);

  useEffect(() => {
    if (!hydrated || !previewMode) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    try {
      localStorage.setItem(PREVIEW_STATE_KEY, JSON.stringify(stateRef.current));
      setLastSaved(Date.now());
      setSyncStatus("saved");
    } catch (e) {
      console.error("[useGame] preview save failed", e);
      setSyncStatus("error");
    }
  }, [state, hydrated, previewMode]);

  // Clean up legacy localStorage keys (one-time)
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      // localStorage may be unavailable; legacy key cleanup is best-effort
    }
  }, []);

  const signOut = useCallback(async () => {
    if (isLocalDemoPreview()) {
      exitLocalDemoPreview();
      return;
    }
    await supabase.auth.signOut();
  }, []);

  // Theme + visual template
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", state.theme === "dark");
    document.documentElement.dataset.template = state.template;
  }, [state.theme, state.template]);

  // Keep persisted achievements in sync with live progress
  useEffect(() => {
    if (!hydrated) return;
    const earned = getEarnedAchievementIds(stateRef.current);
    const prev = stateRef.current.achievements;
    if (
      earned.length === prev.length &&
      earned.every((id) => prev.includes(id))
    ) {
      return;
    }
    setState((s) => ({ ...s, achievements: earned }));
  }, [state, hydrated]);

  // Daily/weekly housekeeping
  useEffect(() => {
    if (!hydrated) return;
    const t = today();
    const w = startOfWeek();
    setState((s) => {
      let next = s;
      if (s.weekAnchor !== w) next = { ...next, weekAnchor: w, weeklyDone: 0 };
      if (s.lastActive && s.lastActive !== t) {
        const diff = (new Date(t).getTime() - new Date(s.lastActive).getTime()) / 86400000;
        if (diff > 1.5) next = { ...next, streak: 0 };
      }
      return next === s ? s : next;
    });
  }, [hydrated]);

  const touch = useCallback(() => {
    setState((s) => {
      const t = today();
      if (s.lastActive === t) return s;
      const yest = new Date();
      yest.setDate(yest.getDate() - 1);
      const yKey = yest.toISOString().slice(0, 10);
      const streak = s.lastActive === yKey ? s.streak + 1 : 1;
      return { ...s, lastActive: t, streak };
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));
  }, []);

  const setTemplate = useCallback((template: AppTemplateId) => {
    setState((s) => ({ ...s, template }));
  }, []);

  const addXp = useCallback(
    (amount: number) => {
      setState((s) => {
        let xp = s.xp + amount,
          level = s.level,
          need = xpForLevel(level);
        while (xp >= need) {
          xp -= need;
          level++;
          need = xpForLevel(level);
        }
        return { ...s, xp, level, totalXp: s.totalXp + amount, weeklyDone: s.weeklyDone + 1 };
      });
      touch();
    },
    [touch],
  );

  const update = useCallback(<K extends keyof GameState>(key: K, value: GameState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const setProfile = useCallback(
    (p: Partial<Pick<GameState, "name" | "focus" | "mainGoal" | "onboarded" | "weeklyTarget">>) => {
      setState((s) => ({ ...s, ...p }));
    },
    [],
  );

  // === Fitness ===
  const setFitnessTargets = useCallback((start: number, current: number, goal: number) => {
    setState((s) => ({
      ...s,
      fitness: {
        ...s.fitness,
        start,
        current,
        goal,
        history:
          s.fitness.history.length === 0 ? [{ date: today(), weight: current }] : s.fitness.history,
      },
    }));
  }, []);

  const updateFitnessTargets = useCallback((patch: Partial<FitnessTargets>) => {
    setState((s) => ({
      ...s,
      fitness: { ...s.fitness, targets: { ...s.fitness.targets, ...patch } },
    }));
  }, []);

  const logWeight = useCallback(
    (weight: number) => {
      setState((s) => ({
        ...s,
        fitness: {
          ...s.fitness,
          current: weight,
          start: s.fitness.start || weight,
          history: [
            ...s.fitness.history.filter((h) => h.date !== today()),
            { date: today(), weight },
          ].sort((a, b) => a.date.localeCompare(b.date)),
          daily: upsertDaily(s.fitness.daily, { weight }),
        },
      }));
      addXp(10);
    },
    [addXp],
  );

  const logWorkout = useCallback(
    (type: string, minutes: number) => {
      setState((s) => ({
        ...s,
        fitness: {
          ...s.fitness,
          workouts: [{ id: id(), date: today(), type, minutes }, ...s.fitness.workouts],
          daily: upsertDaily(
            s.fitness.daily,
            type.toLowerCase().includes("walk")
              ? { walkMin: (findToday(s.fitness.daily)?.walkMin || 0) + minutes }
              : { gymMin: (findToday(s.fitness.daily)?.gymMin || 0) + minutes },
          ),
        },
      }));
      addXp(15);
    },
    [addXp],
  );

  const logDaily = useCallback(
    (patch: Partial<Omit<DailyLog, "date">>, forDate?: string) => {
      const day = forDate ?? today();
      setState((s) => ({
        ...s,
        fitness: { ...s.fitness, daily: upsertDailyForDate(s.fitness.daily, day, patch) },
      }));
      if (day === today()) touch();
    },
    [touch],
  );

  // === DSA ===
  const setDsaGoal = useCallback((goal: number) => {
    setState((s) => ({ ...s, dsa: { ...s.dsa, goal } }));
  }, []);
  const logProblem = useCallback(
    (p: Omit<DsaProblem, "id" | "date">) => {
      setState((s) => ({
        ...s,
        dsa: { ...s.dsa, problems: [{ id: id(), date: today(), ...p }, ...s.dsa.problems] },
      }));
      addXp(p.difficulty === "hard" ? 30 : p.difficulty === "medium" ? 20 : 12);
    },
    [addXp],
  );
  const deleteProblem = useCallback((pid: string) => {
    setState((s) => ({
      ...s,
      dsa: { ...s.dsa, problems: s.dsa.problems.filter((p) => p.id !== pid) },
    }));
  }, []);

  // === Internships ===
  const setInternshipsGoal = useCallback((goal: number) => {
    setState((s) => ({ ...s, internships: { ...s.internships, goal } }));
  }, []);
  const addApplication = useCallback(
    (a: Omit<Application, "id" | "date">) => {
      setState((s) => ({
        ...s,
        internships: {
          ...s.internships,
          applications: [{ id: id(), date: today(), ...a }, ...s.internships.applications],
        },
      }));
      addXp(18);
    },
    [addXp],
  );
  const setApplicationStatus = useCallback((appId: string, status: ApplicationStatus) => {
    setState((s) => ({
      ...s,
      internships: {
        ...s.internships,
        applications: s.internships.applications.map((a) =>
          a.id === appId ? { ...a, status } : a,
        ),
      },
    }));
  }, []);
  const deleteApplication = useCallback((appId: string) => {
    setState((s) => ({
      ...s,
      internships: {
        ...s.internships,
        applications: s.internships.applications.filter((a) => a.id !== appId),
      },
    }));
  }, []);

  // === Projects (new universal model) ===
  const createProject = useCallback((p: Partial<Project> & { name: string }) => {
    const proj: Project = {
      id: id(),
      name: p.name,
      description: p.description,
      status: p.status ?? "planning",
      priority: p.priority ?? "med",
      startDate: p.startDate,
      deadline: p.deadline,
      tasks: [],
      milestones: [],
      notes: [],
      links: [],
      pinned: false,
      createdAt: today(),
    };
    setState((s) => ({ ...s, projects: [proj, ...s.projects] }));
    return proj.id;
  }, []);
  const updateProject = useCallback((pid: string, patch: Partial<Project>) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === pid ? { ...p, ...patch } : p)),
    }));
  }, []);
  const deleteProject = useCallback((pid: string) => {
    setState((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== pid) }));
  }, []);
  const addProjectTask = useCallback(
    (pid: string, t: { title: string; due?: string; priority?: Priority }) => {
      setState((s) => ({
        ...s,
        projects: s.projects.map((p) =>
          p.id === pid
            ? {
                ...p,
                tasks: [
                  {
                    id: id(),
                    title: t.title,
                    done: false,
                    due: t.due,
                    priority: t.priority || "med",
                    createdAt: today(),
                    status: "todo",
                  },
                  ...p.tasks,
                ],
              }
            : p,
        ),
      }));
    },
    [],
  );
  const toggleProjectTask = useCallback(
    (pid: string, tid: string) => {
      setState((s) => ({
        ...s,
        projects: s.projects.map((p) =>
          p.id === pid
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === tid
                    ? {
                        ...t,
                        done: !t.done,
                        doneAt: !t.done ? today() : undefined,
                        status: !t.done ? "done" : "todo",
                      }
                    : t,
                ),
              }
            : p,
        ),
      }));
      addXp(8);
    },
    [addXp],
  );
  const setProjectTaskStatus = useCallback(
    (pid: string, tid: string, status: "todo" | "doing" | "done") => {
      setState((s) => ({
        ...s,
        projects: s.projects.map((p) =>
          p.id === pid
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === tid
                    ? {
                        ...t,
                        status,
                        done: status === "done",
                        doneAt: status === "done" ? today() : undefined,
                      }
                    : t,
                ),
              }
            : p,
        ),
      }));
    },
    [],
  );
  const deleteProjectTask = useCallback((pid: string, tid: string) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) =>
        p.id === pid ? { ...p, tasks: p.tasks.filter((t) => t.id !== tid) } : p,
      ),
    }));
  }, []);
  const addProjectMilestone = useCallback((pid: string, title: string) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) =>
        p.id === pid
          ? { ...p, milestones: [...p.milestones, { id: id(), title, done: false }] }
          : p,
      ),
    }));
  }, []);
  const toggleProjectMilestone = useCallback(
    (pid: string, mid: string) => {
      setState((s) => ({
        ...s,
        projects: s.projects.map((p) =>
          p.id === pid
            ? {
                ...p,
                milestones: p.milestones.map((m) =>
                  m.id === mid ? { ...m, done: !m.done, date: !m.done ? today() : m.date } : m,
                ),
              }
            : p,
        ),
      }));
      addXp(25);
    },
    [addXp],
  );
  const deleteProjectMilestone = useCallback((pid: string, mid: string) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) =>
        p.id === pid ? { ...p, milestones: p.milestones.filter((m) => m.id !== mid) } : p,
      ),
    }));
  }, []);
  const addProjectNote = useCallback((pid: string, body: string) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) =>
        p.id === pid ? { ...p, notes: [{ id: id(), date: today(), body }, ...p.notes] } : p,
      ),
    }));
  }, []);
  const addProjectLink = useCallback((pid: string, label: string, url: string) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) =>
        p.id === pid ? { ...p, links: [{ id: id(), label, url }, ...p.links] } : p,
      ),
    }));
  }, []);
  const toggleProjectPin = useCallback((pid: string) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === pid ? { ...p, pinned: !p.pinned } : p)),
    }));
  }, []);

  // === Career ===
  const setCareer = useCallback((patch: Partial<CareerState>) => {
    setState((s) => ({ ...s, career: { ...s.career, ...patch } }));
  }, []);
  const setCareerPresence = useCallback((patch: Partial<CareerPresence>) => {
    setState((s) => ({
      ...s,
      career: { ...s.career, presence: { ...s.career.presence, ...patch } },
    }));
  }, []);
  const addCareerSkill = useCallback(
    (name: string, level: number, category: CareerSkillCategory = "other") => {
      setState((s) => ({
        ...s,
        career: {
          ...s.career,
          skills: [{ id: id(), name, level, category }, ...s.career.skills],
        },
      }));
    },
    [],
  );
  const removeCareerSkill = useCallback((sid: string) => {
    setState((s) => ({
      ...s,
      career: { ...s.career, skills: s.career.skills.filter((x) => x.id !== sid) },
    }));
  }, []);
  const addCareerCheck = useCallback((text: string) => {
    setState((s) => ({
      ...s,
      career: { ...s.career, checklist: [{ id: id(), text, done: false }, ...s.career.checklist] },
    }));
  }, []);
  const toggleCareerCheck = useCallback(
    (cid: string) => {
      setState((s) => ({
        ...s,
        career: {
          ...s.career,
          checklist: s.career.checklist.map((c) => (c.id === cid ? { ...c, done: !c.done } : c)),
        },
      }));
      addXp(6);
    },
    [addXp],
  );
  const removeCareerCheck = useCallback((cid: string) => {
    setState((s) => ({
      ...s,
      career: { ...s.career, checklist: s.career.checklist.filter((c) => c.id !== cid) },
    }));
  }, []);

  // === Goals ===
  const createGoal = useCallback(
    (
      g: Omit<Goal, "id" | "createdAt" | "archived" | "pinned" | "milestones" | "manualProgress"> &
        Partial<Pick<Goal, "milestones" | "manualProgress">>,
    ) => {
      const goal: Goal = {
        id: id(),
        createdAt: today(),
        archived: false,
        pinned: false,
        manualProgress: g.manualProgress ?? 0,
        milestones: g.milestones ?? [],
        ...g,
      };
      setState((s) => ({ ...s, goals: [goal, ...s.goals] }));
      return goal.id;
    },
    [],
  );
  const updateGoal = useCallback((gid: string, patch: Partial<Goal>) => {
    setState((s) => ({ ...s, goals: s.goals.map((g) => (g.id === gid ? { ...g, ...patch } : g)) }));
  }, []);
  const deleteGoal = useCallback((gid: string) => {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== gid) }));
  }, []);
  const togglePinGoal = useCallback((gid: string) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => (g.id === gid ? { ...g, pinned: !g.pinned } : g)),
    }));
  }, []);
  const archiveGoal = useCallback((gid: string, archived = true) => {
    setState((s) => ({ ...s, goals: s.goals.map((g) => (g.id === gid ? { ...g, archived } : g)) }));
  }, []);
  const addGoalMilestone = useCallback((gid: string, title: string) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id === gid
          ? { ...g, milestones: [...g.milestones, { id: id(), title, done: false }] }
          : g,
      ),
    }));
  }, []);
  const toggleGoalMilestone = useCallback(
    (gid: string, mid: string) => {
      setState((s) => ({
        ...s,
        goals: s.goals.map((g) =>
          g.id === gid
            ? {
                ...g,
                milestones: g.milestones.map((m) =>
                  m.id === mid ? { ...m, done: !m.done, date: !m.done ? today() : m.date } : m,
                ),
              }
            : g,
        ),
      }));
      addXp(15);
    },
    [addXp],
  );
  const removeGoalMilestone = useCallback((gid: string, mid: string) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id === gid ? { ...g, milestones: g.milestones.filter((m) => m.id !== mid) } : g,
      ),
    }));
  }, []);
  const addGoalCategory = useCallback((c: string) => {
    const name = c.trim();
    if (!name) return;
    setState((s) =>
      s.goalCategories.includes(name) ? s : { ...s, goalCategories: [...s.goalCategories, name] },
    );
  }, []);

  // === Journal ===
  const addJournal = useCallback(
    (entry: Omit<JournalEntry, "id" | "date"> & Partial<Pick<JournalEntry, "date">>) => {
      setState((s) => ({
        ...s,
        journal: [{ id: id(), date: entry.date ?? today(), ...entry }, ...s.journal],
      }));
      addXp(5);
    },
    [addXp],
  );
  const updateJournal = useCallback((jid: string, patch: Partial<JournalEntry>) => {
    setState((s) => ({
      ...s,
      journal: s.journal.map((j) => (j.id === jid ? { ...j, ...patch } : j)),
    }));
  }, []);
  const deleteJournal = useCallback((jid: string) => {
    setState((s) => ({ ...s, journal: s.journal.filter((j) => j.id !== jid) }));
  }, []);

  // === Weekly review ===
  const addWeeklyReview = useCallback(
    (r: Omit<WeeklyReview, "id">) => {
      setState((s) => ({ ...s, weeklyReviews: [{ id: id(), ...r }, ...s.weeklyReviews] }));
      addXp(40);
    },
    [addXp],
  );

  // Prefs / persistence
  const setPrefs = useCallback((patch: Partial<DashboardPrefs>) => {
    setState((s) => ({ ...s, prefs: { ...s.prefs, ...patch } }));
  }, []);

  const exportJson = useCallback(() => JSON.stringify(state, null, 2), [state]);
  const importJson = useCallback((raw: string) => {
    const parsed = JSON.parse(raw);
    setState(mergeState(parsed));
  }, []);
  const reset = useCallback(() => setState(EMPTY_STATE), []);

  const completeOnboarding = useCallback((payload: OnboardingPayload) => {
    setState((s) => ({
      ...s,
      name: payload.name,
      mainGoal: payload.mainGoal,
      focus: "Begin where you are.",
      onboarded: true,
      prefs: { ...s.prefs, modules: payload.modules },
    }));
  }, []);

  const resetDemoState = useCallback(() => {
    setState(createDemoState());
  }, []);

  return {
    state,
    hydrated,
    lastSaved,
    syncStatus,
    userId,
    previewMode,
    signOut,
    update,
    setProfile,
    toggleTheme,
    setTemplate,
    touch,

    setFitnessTargets,
    updateFitnessTargets,
    logWeight,
    logWorkout,
    logDaily,
    flushSave,
    setDsaGoal,
    logProblem,
    deleteProblem,
    setInternshipsGoal,
    addApplication,
    setApplicationStatus,
    deleteApplication,
    createProject,
    updateProject,
    deleteProject,
    addProjectTask,
    toggleProjectTask,
    setProjectTaskStatus,
    deleteProjectTask,
    addProjectMilestone,
    toggleProjectMilestone,
    deleteProjectMilestone,
    addProjectNote,
    addProjectLink,
    toggleProjectPin,
    setCareer,
    setCareerPresence,
    addCareerSkill,
    removeCareerSkill,
    addCareerCheck,
    toggleCareerCheck,
    removeCareerCheck,
    createGoal,
    updateGoal,
    deleteGoal,
    togglePinGoal,
    archiveGoal,
    addGoalMilestone,
    toggleGoalMilestone,
    removeGoalMilestone,
    addGoalCategory,
    addJournal,
    updateJournal,
    deleteJournal,
    addWeeklyReview,
    setPrefs,
    addXp,
    xpForLevel,
    exportJson,
    importJson,
    reset,
    completeOnboarding,
    resetDemoState,
    // legacy aliases used by older routes:
    toggleMilestone: (_mid: string) => {},
    addMilestone: (_t: string, _c: string) => {},
    deleteMilestone: (_mid: string) => {},
  };
}

// ===== helpers =====
function findToday(daily: DailyLog[]) {
  const t = today();
  return daily.find((d) => d.date === t);
}
function upsertDaily(daily: DailyLog[], patch: Partial<Omit<DailyLog, "date">>): DailyLog[] {
  return upsertDailyForDate(daily, today(), patch);
}

function upsertDailyForDate(
  daily: DailyLog[],
  date: string,
  patch: Partial<Omit<DailyLog, "date">>,
): DailyLog[] {
  const existing = daily.find((d) => d.date === date);
  const next = existing ? { ...existing, ...patch } : { date, ...patch };
  return [next, ...daily.filter((d) => d.date !== date)].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

function calorieDailyPart(calories: number, target: number): number {
  if (!target) return 0;
  const ratio = calories / target;
  if (ratio >= 0.9 && ratio <= 1.1) return 1;
  if (ratio < 0.9) return Math.min(1, calories / target);
  return Math.max(0.4, 1 - (ratio - 1.1) * 3);
}

export function calorieBarWidth(calories: number | undefined, target: number): number {
  if (calories === undefined || !target) return 0;
  return clampPercent((calories / target) * 100);
}

export const FITNESS_STREAK_THRESHOLD = 50;

export function hasDailyHabitLog(log: DailyLog): boolean {
  return (
    log.calories !== undefined ||
    log.protein !== undefined ||
    log.water !== undefined ||
    log.steps !== undefined ||
    log.sleep !== undefined ||
    log.walkMin !== undefined ||
    log.gymMin !== undefined
  );
}

export function calorieInSuccessBand(calories: number | undefined, target: number): boolean {
  if (calories === undefined || !target) return false;
  const ratio = calories / target;
  return ratio >= 0.9 && ratio <= 1.05;
}

export function calorieStatusText(calories: number | undefined, target: number): string | null {
  if (calories === undefined || !target) return null;
  const ratio = calories / target;
  if (ratio > 1.05) return `${Math.round(calories - target)} kcal over target`;
  if (ratio >= 0.995 && ratio <= 1.05) return "Target reached";
  return null;
}

export function goalProgress(g: Goal): number {
  if (g.milestones.length > 0) {
    return clampPercent((g.milestones.filter((m) => m.done).length / g.milestones.length) * 100);
  }
  return clampPercent(g.manualProgress || 0);
}

export function projectProgress(p: Project): number {
  const tasks = p.tasks.length;
  const milestones = p.milestones.length;
  if (!tasks && !milestones) return 0;
  const taskPct = tasks ? p.tasks.filter((t) => t.done).length / tasks : 0;
  const msPct = milestones ? p.milestones.filter((m) => m.done).length / milestones : 0;
  if (tasks && milestones) return clampPercent((taskPct * 0.6 + msPct * 0.4) * 100);
  return clampPercent((tasks ? taskPct : msPct) * 100);
}

export function dailyScore(log: DailyLog | undefined, t: FitnessTargets): number {
  if (!log) return 0;
  const parts: number[] = [];
  if (log.calories !== undefined && t.calories)
    parts.push(calorieDailyPart(log.calories, t.calories));
  if (log.protein !== undefined && t.protein) parts.push(Math.min(1, log.protein / t.protein));
  if (log.water !== undefined && t.water) parts.push(Math.min(1, log.water / t.water));
  if (log.steps !== undefined && t.steps) parts.push(Math.min(1, log.steps / t.steps));
  if (log.sleep !== undefined && t.sleep) parts.push(Math.min(1, log.sleep / t.sleep));
  if (log.walkMin !== undefined && t.walkMinDaily)
    parts.push(Math.min(1, log.walkMin / t.walkMinDaily));
  const gymDaily = t.gymMinWeekly > 0 ? t.gymMinWeekly / 7 : 0;
  if (log.gymMin !== undefined && gymDaily > 0) parts.push(Math.min(1, log.gymMin / gymDaily));
  if (!parts.length) return 0;
  return clampPercent(Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100));
}

/** Average daily score on days with habit data in the last N days (unlogged days are skipped). */
export function fitnessWindowScore(daily: DailyLog[], t: FitnessTargets, days: number): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  const logged = daily.filter((d) => d.date >= cutoffKey && hasDailyHabitLog(d));
  if (!logged.length) return 0;
  const sum = logged.reduce((a, d) => a + dailyScore(d, t), 0);
  return Math.round(sum / logged.length);
}

/** Consecutive days (walking back from today) where logged habits meet the streak threshold. */
export function fitnessHabitStreak(daily: DailyLog[], t: FitnessTargets): number {
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const key = cursor.toISOString().slice(0, 10);
    const log = daily.find((d) => d.date === key);
    if (log && hasDailyHabitLog(log)) {
      if (dailyScore(log, t) >= FITNESS_STREAK_THRESHOLD) streak++;
      else if (i > 0) break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function useDerived() {
  return useMemo(() => ({}), []);
}

// ===== Shared store via Context =====
// All consumers must read from the same instance so mutations propagate
// immediately across every route (no more "refresh to see changes").
type GameApi = ReturnType<typeof useGameStore>;
const GameContext = createContext<GameApi | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const api = useGameStore();
  return createElement(GameContext.Provider, { value: api }, children);
}

export function useGame(): GameApi {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame must be used inside <GameProvider>");
  }
  return ctx;
}
