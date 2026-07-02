/** Public product positioning — LamaOS is a hosted app, not a self-host kit. */
export const APP_NAME = "LamaOS";
export const APP_TAGLINE = "Your private life operating system";
export const HOSTED_FREE_BETA = true;

export function getAppUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return "https://lama-os.vercel.app";
}
