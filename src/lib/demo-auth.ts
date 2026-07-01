import { supabase } from "@/integrations/supabase/client";

export const DEMO_SEED_VERSION = 1;

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
  return Boolean(getDemoEmail() && import.meta.env.VITE_DEMO_PASSWORD);
}

export async function signInAsDemo(): Promise<void> {
  const email = getDemoEmail();
  const password = import.meta.env.VITE_DEMO_PASSWORD as string | undefined;
  if (!email || !password) {
    throw new Error("Demo account is not configured. Set VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD.");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (!signInError) return;

  const { error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) {
    throw signInError;
  }

  const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
  if (retryError) throw retryError;
}
