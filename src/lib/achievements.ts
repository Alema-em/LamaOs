import type { Application, GameState, Project, ProjectMilestone } from "@/hooks/use-game";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  check: (s: GameState) => boolean;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first-app",
    title: "First Internship Application",
    description: "The first knock on the door.",
    check: (s) => s.internships.applications.length >= 1,
  },
  {
    id: "dsa-10",
    title: "10 DSA Problems",
    description: "The forest is finding its rhythm.",
    check: (s) => s.dsa.problems.length >= 10,
  },
  {
    id: "dsa-50",
    title: "50 DSA Problems",
    description: "Patterns whisper themselves now.",
    check: (s) => s.dsa.problems.length >= 50,
  },
  {
    id: "dsa-100",
    title: "100 DSA Problems",
    description: "A canopy that filters the sun.",
    check: (s) => s.dsa.problems.length >= 100,
  },
  {
    id: "lose-5",
    title: "Lost 5kg",
    description: "Lighter on the trail, brighter in the eyes.",
    check: (s) => s.fitness.start - s.fitness.current >= 5,
  },
  {
    id: "lose-10",
    title: "Lost 10kg",
    description: "Patience compounding.",
    check: (s) => s.fitness.start - s.fitness.current >= 10,
  },
  {
    id: "first-project",
    title: "First Project Shipped",
    description: "The studio has a running heartbeat.",
    check: (s) =>
      (s.projects || []).some(
        (p: Project) =>
          p.status === "shipped" ||
          p.milestones?.filter((m: ProjectMilestone) => m.done).length >= 4,
      ),
  },
  {
    id: "tech-intern",
    title: "Technical Internship Secured",
    description: "A door opens. You walk in.",
    check: (s) => s.internships.applications.some((a: Application) => a.status === "offer"),
  },
  {
    id: "streak-30",
    title: "30-Day Streak",
    description: "A new gravity.",
    check: (s) => s.streak >= 30,
  },
  {
    id: "level-10",
    title: "Level 10",
    description: "Quiet mastery.",
    check: (s) => s.level >= 10,
  },
];

export function getEarnedAchievements(state: GameState): AchievementDef[] {
  return ACHIEVEMENT_DEFS.filter(
    (d) => d.check(state) || state.achievements.includes(d.id),
  );
}

export function getEarnedAchievementIds(state: GameState): string[] {
  return getEarnedAchievements(state).map((d) => d.id);
}
