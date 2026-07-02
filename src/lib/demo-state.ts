import { DEMO_SEED_VERSION } from "@/lib/demo-auth";
import { ALL_MODULES_ON } from "@/lib/modules";
import {
  DEFAULT_CAREER,
  DEFAULT_FITNESS_TARGETS,
  DEFAULT_PREFS,
  EMPTY_STATE,
  type GameState,
  today,
} from "@/hooks/use-game";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function rid() {
  return Math.random().toString(36).slice(2, 10);
}

/** Rich sample state for the demo account — safe to reset anytime. */
export function createDemoState(): GameState {
  const t = today();
  const weights = [78.2, 77.8, 77.4, 77.1, 76.8, 76.5, 76.2, 75.9, 75.6, 75.2, 74.9, 74.6, 74.2, 73.9, 73.6, 73.2, 72.8, 72.4];

  const problems = [
    { title: "Two Sum", topic: "Arrays", difficulty: "easy" as const, days: 1 },
    { title: "Valid Parentheses", topic: "Stacks", difficulty: "easy" as const, days: 2 },
    { title: "Merge Intervals", topic: "Arrays", difficulty: "medium" as const, days: 3 },
    { title: "Binary Search", topic: "Binary Search", difficulty: "easy" as const, days: 4 },
    { title: "LRU Cache", topic: "Design", difficulty: "hard" as const, days: 5 },
    { title: "Course Schedule", topic: "Graphs", difficulty: "medium" as const, days: 6 },
    { title: "House Robber", topic: "DP", difficulty: "medium" as const, days: 8 },
    { title: "Subarray Sum", topic: "Arrays", difficulty: "medium" as const, days: 9 },
    { title: "Invert Binary Tree", topic: "Trees", difficulty: "easy" as const, days: 11 },
    { title: "Word Break", topic: "DP", difficulty: "medium" as const, days: 13 },
    { title: "Koko Eating Bananas", topic: "Binary Search", difficulty: "medium" as const, days: 15 },
    { title: "Daily Temperatures", topic: "Stacks", difficulty: "medium" as const, days: 17 },
    { title: "Clone Graph", topic: "Graphs", difficulty: "medium" as const, days: 19 },
    { title: "Pacific Atlantic", topic: "Graphs", difficulty: "medium" as const, days: 22 },
    { title: "Serialize Tree", topic: "Trees", difficulty: "hard" as const, days: 25 },
    { title: "Min Window Substring", topic: "Strings", difficulty: "hard" as const, days: 28 },
    { title: "Top K Frequent", topic: "Heap", difficulty: "medium" as const, days: 31 },
    { title: "Coin Change", topic: "DP", difficulty: "medium" as const, days: 34 },
    { title: "Rotting Oranges", topic: "Graphs", difficulty: "medium" as const, days: 38 },
    { title: "Meeting Rooms II", topic: "Heap", difficulty: "medium" as const, days: 42 },
  ];

  const dailyLogs = Array.from({ length: 14 }, (_, i) => {
    const date = daysAgo(13 - i);
    const steps = 6200 + i * 280 + (i % 3) * 400;
    return {
      date,
      calories: 1950 + (i % 4) * 80,
      protein: 120 + (i % 3) * 8,
      water: 2.2 + (i % 2) * 0.4,
      steps,
      sleep: 7 + (i % 3) * 0.25,
      walkMin: 25 + (i % 4) * 5,
      gymMin: i % 2 === 0 ? 45 : 0,
    };
  });

  return {
    ...EMPTY_STATE,
    name: "Demo",
    focus: "Ship one thing. Log one habit. Repeat.",
    mainGoal: "Land a SWE internship · ship LamaOS · stay consistent",
    onboarded: true,
    theme: "light",
    level: 7,
    xp: 42,
    totalXp: 680,
    streak: 12,
    lastActive: t,
    weeklyTarget: 7,
    weeklyDone: 5,
    fitness: {
      start: 78,
      current: 72.4,
      goal: 65,
      history: weights.map((weight, i) => ({ date: daysAgo(weights.length - 1 - i), weight })),
      workouts: [
        { id: rid(), date: daysAgo(1), type: "Strength", minutes: 50 },
        { id: rid(), date: daysAgo(3), type: "Run", minutes: 35 },
        { id: rid(), date: daysAgo(5), type: "Walk", minutes: 40 },
      ],
      daily: dailyLogs,
      targets: { ...DEFAULT_FITNESS_TARGETS },
    },
    dsa: {
      goal: 150,
      problems: problems.map((p, i) => ({
        id: rid(),
        date: daysAgo(p.days),
        title: p.title,
        topic: p.topic,
        difficulty: p.difficulty,
      })),
    },
    internships: {
      goal: 30,
      applications: [
        { id: rid(), company: "Stripe", role: "SWE Intern", status: "interview", date: daysAgo(12) },
        { id: rid(), company: "Notion", role: "Product Eng", status: "applied", date: daysAgo(18) },
        { id: rid(), company: "Figma", role: "Intern", status: "applied", date: daysAgo(22) },
        { id: rid(), company: "Local startup", role: "Full-stack", status: "offer", date: daysAgo(40) },
      ],
    },
    projects: [
      {
        id: rid(),
        name: "LamaOS",
        description: "Personal operating system for ambitious builders.",
        status: "active",
        priority: "high",
        pinned: true,
        createdAt: daysAgo(60),
        tasks: [
          { id: rid(), title: "Landing page", done: true, priority: "high", createdAt: daysAgo(30), status: "done" },
          { id: rid(), title: "Onboarding flow", done: true, priority: "high", createdAt: daysAgo(14), status: "done" },
          { id: rid(), title: "Demo account", done: false, priority: "med", createdAt: daysAgo(7), status: "doing" },
        ],
        milestones: [
          { id: rid(), title: "Public beta", done: false },
          { id: rid(), title: "First 10 users", done: false },
        ],
        notes: [],
        links: [],
      },
      {
        id: rid(),
        name: "Portfolio site",
        description: "Case studies and writing.",
        status: "active",
        priority: "med",
        pinned: false,
        createdAt: daysAgo(45),
        tasks: [
          { id: rid(), title: "Hero redesign", done: true, priority: "med", createdAt: daysAgo(20), status: "done" },
          { id: rid(), title: "Project write-ups", done: false, priority: "med", createdAt: daysAgo(10), status: "todo" },
        ],
        milestones: [],
        notes: [],
        links: [],
      },
    ],
    career: {
      ...DEFAULT_CAREER,
      resumeUpdates: 3,
      linkedinScore: 72,
      githubScore: 85,
      technicalScore: 68,
      networkingContacts: 8,
      interviewPrepHours: 12,
      presence: {
        resumeFresh: true,
        linkedinUpdated: true,
        githubActive: true,
        portfolioLive: false,
      },
      skills: [
        { id: rid(), name: "TypeScript", level: 4, category: "language" },
        { id: rid(), name: "React", level: 4, category: "framework" },
        { id: rid(), name: "System design", level: 2, category: "systems" },
      ],
    },
    goals: [
      {
        id: rid(),
        title: "Summer internship",
        category: "Career",
        createdAt: daysAgo(90),
        archived: false,
        pinned: true,
        manualProgress: 0,
        targetDate: daysAgo(-60),
        milestones: [
          { id: rid(), title: "Resume v2", done: true, date: daysAgo(30) },
          { id: rid(), title: "10 applications", done: false },
        ],
      },
      {
        id: rid(),
        title: "Reach goal weight",
        category: "Fitness",
        createdAt: daysAgo(80),
        archived: false,
        pinned: false,
        manualProgress: 0,
        milestones: [
          { id: rid(), title: "First 5kg", done: true, date: daysAgo(20) },
          { id: rid(), title: "Hit 70kg", done: false },
        ],
      },
    ],
    journal: [
      {
        id: rid(),
        date: daysAgo(0),
        kind: "daily",
        title: "Small wins compound",
        body: "Closed the onboarding task. Walked 9k steps. One honest day.",
        mood: 4,
      },
      {
        id: rid(),
        date: daysAgo(6),
        kind: "weekly",
        title: "Week in review",
        body: "DSA streak is back. Fitness logging is consistent. Next week: one project milestone.",
        mood: 5,
      },
    ],
    achievements: ["first-log", "streak-7"],
    prefs: {
      ...DEFAULT_PREFS,
      modules: { ...ALL_MODULES_ON },
      demoSeedVersion: DEMO_SEED_VERSION,
    },
  };
}

export function demoSeedNeedsRefresh(state: GameState): boolean {
  return (state.prefs.demoSeedVersion ?? 0) !== DEMO_SEED_VERSION;
}

export function isBareAccount(state: GameState): boolean {
  return (
    !state.name &&
    state.dsa.problems.length === 0 &&
    state.fitness.history.length === 0 &&
    state.projects.length === 0
  );
}
