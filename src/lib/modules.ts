import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  Briefcase,
  Code2,
  FolderKanban,
  GraduationCap,
  Rocket,
  Target,
} from "lucide-react";

export const LAMA_MODULE_IDS = [
  "mission",
  "fitness",
  "dsa",
  "internships",
  "projects",
  "career",
  "goals",
  "journal",
] as const;

export type LamaModuleId = (typeof LAMA_MODULE_IDS)[number];

export type ModuleFlags = Record<LamaModuleId, boolean>;

export type OnboardingPreset = "full" | "student" | "builder" | "custom";

export const MODULE_META: {
  id: LamaModuleId;
  label: string;
  desc: string;
  path: string;
  icon: LucideIcon;
}[] = [
  {
    id: "mission",
    label: "Mission",
    desc: "Quarterly focus and weekly priorities",
    path: "/mission",
    icon: Rocket,
  },
  {
    id: "fitness",
    label: "Fitness",
    desc: "Weight, habits, and daily targets",
    path: "/fitness",
    icon: Activity,
  },
  {
    id: "dsa",
    label: "DSA",
    desc: "Practice log and topic coverage",
    path: "/dsa",
    icon: Code2,
  },
  {
    id: "internships",
    label: "Internships",
    desc: "Application pipeline",
    path: "/internships",
    icon: Briefcase,
  },
  {
    id: "projects",
    label: "Projects",
    desc: "Tasks, milestones, shipping",
    path: "/projects",
    icon: FolderKanban,
  },
  {
    id: "career",
    label: "Career",
    desc: "Skills, resume, networking",
    path: "/career",
    icon: GraduationCap,
  },
  {
    id: "goals",
    label: "Goals",
    desc: "Long-horizon aims",
    path: "/goals",
    icon: Target,
  },
  {
    id: "journal",
    label: "Journal",
    desc: "Daily notes and reviews",
    path: "/journal",
    icon: BookOpen,
  },
];

export const ALL_MODULES_ON: ModuleFlags = {
  mission: true,
  fitness: true,
  dsa: true,
  internships: true,
  projects: true,
  career: true,
  goals: true,
  journal: true,
};

const OFF: ModuleFlags = {
  mission: false,
  fitness: false,
  dsa: false,
  internships: false,
  projects: false,
  career: false,
  goals: false,
  journal: false,
};

export const PRESET_MODULES: Record<Exclude<OnboardingPreset, "custom">, ModuleFlags> = {
  full: ALL_MODULES_ON,
  student: {
    ...OFF,
    mission: true,
    fitness: true,
    dsa: true,
    internships: true,
    career: true,
    goals: true,
    journal: true,
  },
  builder: {
    ...OFF,
    mission: true,
    projects: true,
    goals: true,
    career: true,
    journal: true,
  },
};

export function routeModule(path: string): LamaModuleId | null {
  const hit = MODULE_META.find((m) => m.path === path);
  return hit?.id ?? null;
}

export function mergeModuleFlags(
  preset: OnboardingPreset,
  custom?: Partial<ModuleFlags>,
): ModuleFlags {
  const base = preset === "custom" ? { ...ALL_MODULES_ON } : { ...PRESET_MODULES[preset] };
  if (custom) {
    for (const id of LAMA_MODULE_IDS) {
      if (custom[id] !== undefined) base[id] = custom[id]!;
    }
  }
  return base;
}
