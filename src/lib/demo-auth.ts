import { signInDemoAccount } from "@/lib/api/demo.functions";
import { supabase } from "@/integrations/supabase/client";

export const DEMO_SEED_VERSION = 1;
export const PREVIEW_STORAGE_KEY = "lamaos-demo-preview";
export const PREVIEW_STATE_KEY = "lamaos-demo-preview-state";
export const PREVIEW_CHANGED_EVENT = "lamaos-demo-preview-changed";

export type DemoEntryMode = "auth" | "preview";

/** Public demo email for UI checks — not a secret. Must match server DEMO_EMAIL. */
export function getDemoEmail(): string | undefined {
  const email = import.meta.env.VITE_DEMO_EMAIL?.trim();
  return email || undefined;
}

export function isDemoEmail(email: string | null | undefined): boolean {
  const demo = getDemoEmail();
  if (!demo || !email) return false;
  return email.toLowerCase() === demo.toLowerCase();
}

export function isLocalDemoPreview(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(PREVIEW_STORAGE_KEY) === "1";
}

export function enterLocalDemoPreview(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(PREVIEW_STORAGE_KEY, "1");
  window.dispatchEvent(new Event(PREVIEW_CHANGED_EVENT));
}

export function exitLocalDemoPreview(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(PREVIEW_STORAGE_KEY);
  try {
    localStorage.removeItem(PREVIEW_STATE_KEY);
  } catch {
    // best-effort
  }
  window.dispatchEvent(new Event(PREVIEW_CHANGED_EVENT));
}

/** Try cloud demo via server-side auth; fall back to browser-only preview. */
export async function startDemo(): Promise<DemoEntryMode> {
  try {
    const result = await signInDemoAccount();
    if (result.ok) {
      const { error } = await supabase.auth.setSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });
      if (!error) return "auth";
    }
  } catch (e) {
    console.warn("[demo] cloud sign-in unavailable", e);
  }

  enterLocalDemoPreview();
  return "preview";
}

/** @deprecated Use startDemo() */
export async function signInAsDemo(): Promise<void> {
  await startDemo();
}
