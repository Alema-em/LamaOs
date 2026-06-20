# Lama OS

**A personal life operating system for goals, fitness, DSA, projects, and daily consistency.**

Lama OS is a private web app for tracking the areas that matter day to day: fitness habits, DSA practice, projects, goals, internships, journaling and a unified dashboard. Your data stays tied to your account and syncs through Supabase.

## Features

- **Dashboard** — Today’s focus, streaks, progress breakdown, quick logging and pinned goals/projects
- **Fitness** — Weight trends, daily checklist (steps, calories, protein, water, sleep), step history rings and habit scores
- **DSA** — Problem log, topic coverage, activity grid, goal progress and practice streak
- **Projects & goals** — Tasks, milestones, deadlines and mission-style planning
- **Career & internships** — Applications, skills and career checklist
- **Journal & history** — Entries, timelines and weekly snapshots
- **Auth** — Email/password and Google sign-in via Supabase

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [TanStack Start](https://tanstack.com/start) (SSR) + [TanStack Router](https://tanstack.com/router)
- [Vite 7](https://vite.dev/) + [Nitro](https://nitro.build/) (deployment adapter)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Auth + PostgreSQL JSONB state storage)
- [Recharts](https://recharts.org/), [Framer Motion](https://www.framer.com/motion/), [Radix UI](https://www.radix-ui.com/)

## Local setup

**Requirements:** Node.js **≥ 22.12.0**, npm

```bash
git clone <your-repo-url>
cd LamaOs
npm install
cp .env.example .env
```

Fill in `.env` with your Supabase project values (see below). Then:

```bash
npm run dev
```

The dev server runs at [http://localhost:8080](http://localhost:8080).

## Environment variables

Copy `.env.example` to `.env` and set:

| Variable | Used by | Description |
|----------|---------|-------------|
| `VITE_SUPABASE_URL` | Browser | Supabase project URL (public) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser | Supabase anon/publishable key (public) |
| `SUPABASE_URL` | Server (SSR) | Same project URL for server-side code |
| `SUPABASE_PUBLISHABLE_KEY` | Server (SSR) | Same publishable key for server-side code |

Never commit `.env` or real keys. For production, set the same four variables in your hosting provider’s environment settings.

**Supabase auth:** Enable Email and Google providers in the Supabase dashboard. Add your local and production redirect URLs (e.g. `http://localhost:8080/` and `https://your-app.vercel.app/`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build (client + SSR via Nitro) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## Data & privacy

- App state (goals, fitness logs, DSA problems, projects, etc.) is stored in **Supabase** as JSON in the `user_state` table, scoped per authenticated user with Row Level Security.
- Only you can read or write your row when signed in.
- Lama OS does not sell or share your data; it is a personal tracker backed by your own Supabase project.

## Deployment

Lama OS is configured for **Vercel** with the official TanStack Start + Nitro setup (`nitro/vite` in `vite.config.ts`). Vercel auto-detects the framework when the Nitro plugin is present.

1. Push the repo to GitHub (after initializing git locally).
2. Import the project in Vercel and select the **TanStack Start** framework preset (or let Vercel auto-detect).
3. Set Node.js to **22.x** and add all four environment variables above.
4. Deploy. Confirm Google OAuth redirect URLs include your Vercel production URL.

## License

Private project 
