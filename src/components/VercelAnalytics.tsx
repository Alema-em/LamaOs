import { Analytics } from "@vercel/analytics/react";

/** Page views on Vercel deployments — no-op on localhost. */
export function VercelAnalytics() {
  return <Analytics />;
}
