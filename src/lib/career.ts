import type { CareerState, GameState, Project } from "@/hooks/use-game";
import { averagePercent, clampPercent, safePercentage } from "@/lib/progress";

export const CAREER_BUCKETS = {
  craft: 0.35,
  pipeline: 0.3,
  presence: 0.2,
  network: 0.15,
} as const;

export const SKILL_CATEGORIES = [
  { id: "language", label: "Languages" },
  { id: "framework", label: "Frameworks" },
  { id: "systems", label: "Systems" },
  { id: "tools", label: "Tools" },
  { id: "other", label: "Other" },
] as const;

export type CareerSkillCategory = (typeof SKILL_CATEGORIES)[number]["id"];

export interface CareerMetrics {
  readiness: number;
  craft: number;
  pipeline: number;
  presence: number;
  network: number;
  dsaCount: number;
  dsaGoal: number;
  projectCount: number;
  apps: number;
  interviews: number;
  offers: number;
  openChecks: number;
}

export interface CareerAction {
  title: string;
  detail: string;
  to?: string;
}

function projectPct(p: Project): number {
  const tasks = p.tasks.length;
  const milestones = p.milestones.length;
  if (!tasks && !milestones) return 0;
  const taskPct = tasks ? p.tasks.filter((t) => t.done).length / tasks : 0;
  const msPct = milestones ? p.milestones.filter((m) => m.done).length / milestones : 0;
  if (tasks && milestones) return clampPercent((taskPct * 0.6 + msPct * 0.4) * 100);
  return clampPercent((tasks ? taskPct : msPct) * 100);
}

function presenceScore(career: CareerState): number {
  const p = career.presence;
  let score = 0;
  if (p.resumeFresh || career.resumeUpdates > 0) score += 25;
  if (p.linkedinUpdated || career.linkedinScore >= 50) score += 25;
  if (p.githubActive || career.githubScore >= 50) score += 25;
  if (p.portfolioLive) score += 25;
  const skillAvg =
    career.skills.length > 0
      ? career.skills.reduce((a, s) => a + s.level, 0) / (career.skills.length * 5)
      : 0;
  return clampPercent(score + skillAvg * 20);
}

function networkScore(career: CareerState): number {
  const contacts = clampPercent(Math.min(100, career.networkingContacts * 8));
  const prep = clampPercent(Math.min(100, career.interviewPrepHours * 4));
  return clampPercent(contacts * 0.6 + prep * 0.4);
}

export function computeCareerMetrics(state: GameState): CareerMetrics {
  const dsaCount = state.dsa.problems.length;
  const dsaGoal = state.dsa.goal || 150;
  const dsaScore = clampPercent(safePercentage(dsaCount, dsaGoal));

  const projAvg = averagePercent(state.projects.map((p) => projectPct(p)));
  const projectsScore = clampPercent(
    projAvg * (state.projects.length >= 2 ? 1 : state.projects.length === 1 ? 0.75 : 0.35),
  );
  const craft = clampPercent(dsaScore * 0.55 + projectsScore * 0.45);

  const apps = state.internships.applications;
  const interviews = apps.filter((a) => a.status === "interview").length;
  const offers = apps.filter((a) => a.status === "offer").length;
  const pipeline =
    offers > 0
      ? 100
      : clampPercent(Math.min(95, apps.length * 7 + interviews * 14 + (state.internships.goal > 0 ? 5 : 0)));

  const presence = presenceScore(state.career);
  const network = networkScore(state.career);

  const readiness = Math.round(
    craft * CAREER_BUCKETS.craft +
      pipeline * CAREER_BUCKETS.pipeline +
      presence * CAREER_BUCKETS.presence +
      network * CAREER_BUCKETS.network,
  );

  return {
    readiness,
    craft: Math.round(craft),
    pipeline: Math.round(pipeline),
    presence: Math.round(presence),
    network: Math.round(network),
    dsaCount,
    dsaGoal,
    projectCount: state.projects.length,
    apps: apps.length,
    interviews,
    offers,
    openChecks: state.career.checklist.filter((c) => !c.done).length,
  };
}

export function buildCareerActions(state: GameState, m: CareerMetrics): CareerAction[] {
  const actions: (CareerAction & { rank: number })[] = [];

  if (m.dsaCount < Math.min(30, m.dsaGoal * 0.2)) {
    actions.push({
      rank: 90,
      title: "Log DSA practice",
      detail: `${m.dsaCount}/${m.dsaGoal} problems — one logged problem today compounds.`,
      to: "/dsa",
    });
  } else if (m.dsaCount < m.dsaGoal * 0.5) {
    actions.push({
      rank: 60,
      title: "Keep DSA momentum",
      detail: `Aim for 3 problems this week. You're at ${m.dsaCount}/${m.dsaGoal}.`,
      to: "/dsa",
    });
  }

  if (m.projectCount === 0) {
    actions.push({
      rank: 85,
      title: "Start a shippable project",
      detail: "One visible repo or demo beats ten half-built ideas.",
      to: "/projects",
    });
  } else if (m.projectCount < 2) {
    actions.push({
      rank: 55,
      title: "Add a second project",
      detail: "Show range — e.g. one product build + one technical depth piece.",
      to: "/projects",
    });
  } else {
    const stalled = state.projects.find((p) => projectPct(p) < 40 && p.status === "active");
    if (stalled) {
      actions.push({
        rank: 70,
        title: `Push "${stalled.name}" forward`,
        detail: "Finish the next milestone — shipping beats polishing.",
        to: "/projects",
      });
    }
  }

  if (m.apps < 3) {
    actions.push({
      rank: 80,
      title: "Apply to 3 roles this week",
      detail: "Pipeline score grows fastest with consistent applications.",
      to: "/internships",
    });
  } else if (m.interviews === 0 && m.apps >= 5) {
    actions.push({
      rank: 75,
      title: "Follow up on applications",
      detail: `${m.apps} apps logged — reach out or refine targeting.`,
      to: "/internships",
    });
  }

  const p = state.career.presence;
  if (!p.resumeFresh && state.career.resumeUpdates === 0) {
    actions.push({
      rank: 65,
      title: "Refresh your resume",
      detail: "Mark it done in Presence when you've updated it this month.",
    });
  }
  if (!p.linkedinUpdated) {
    actions.push({
      rank: 50,
      title: "Tune LinkedIn",
      detail: "Headline + one quantified bullet. Toggle when done.",
    });
  }
  if (!p.githubActive) {
    actions.push({
      rank: 45,
      title: "Make GitHub active",
      detail: "Pin a repo, update README, or push a small commit this week.",
    });
  }
  if (state.career.skills.length < 3) {
    actions.push({
      rank: 40,
      title: "Track core skills",
      detail: "Add 3 strengths you want recruiters to see.",
    });
  }
  if (state.career.networkingContacts < 3) {
    actions.push({
      rank: 35,
      title: "Reach out to 2 people",
      detail: "Coffee chats, not cold asks — log contacts below.",
    });
  }

  const nextCheck = state.career.checklist.find((c) => !c.done);
  if (nextCheck) {
    actions.push({
      rank: 30,
      title: "Checklist item",
      detail: nextCheck.text,
    });
  }

  return actions
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 4)
    .map(({ title, detail, to }) => ({ title, detail, to }));
}
