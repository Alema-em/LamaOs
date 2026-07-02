import { supabase } from "@/integrations/supabase/client";

export const DEMO_SEED_VERSION = 1;
export const PREVIEW_STORAGE_KEY = "lamaos-demo-preview";
export const PREVIEW_STATE_KEY = "lamaos-demo-preview-state";
export const PREVIEW_CHANGED_EVENT = "lamaos-demo-preview-changed";

export type DemoEntryMode = "auth" | "preview";

export function getDemoEmail(): string | undefined {
  const email = import.meta.env.VITE_DEMO_EMAIL?.trim();
  return email || undefined;
}

export function isDemoEmail(email: string | null | undefined): boolean {
  const demo = getDemoEmail();
  if (!demo || !email) return false;
  return email.toLowerCase() === demo.toLowerCase();
}

export function isDemoConfigured(): boolean {
  const password = import.meta.env.VITE_DEMO_PASSWORD as string | undefined;
  return Boolean(getDemoEmail() && password && password.length >= 6);
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

async function signInAsDemoAccount(): Promise<boolean> {
  const email = getDemoEmail();
  const password = import.meta.env.VITE_DEMO_PASSWORD as string | undefined;
  if (!email || !password || password.length < 6) return false;

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (!signInError) return true;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) return false;

  if (signUpData.session) return true;

  const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
  return !retryError;
}

/** Try cloud demo login; fall back to browser-only preview when auth is blocked. */
export async function startDemo(): Promise<DemoEntryMode> {
  if (isDemoConfigured()) {
    const signedIn = await signInAsDemoAccount();
    if (signedIn) return "auth";
  }

  enterLocalDemoPreview();
  return "preview";
}

/** @deprecated Use startDemo() */
export async function signInAsDemo(): Promise<void> {
  const mode = await startDemo();
  if (mode === "preview") return;
}
