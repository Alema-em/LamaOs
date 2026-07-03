import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type DemoSignInResult =
  | { ok: true; access_token: string; refresh_token: string }
  | { ok: false };

function getDemoCredentials() {
  const email = process.env.DEMO_EMAIL?.trim();
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password || password.length < 6) return null;
  return { email, password };
}

function createServerAuthClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase server environment variables.");
  }
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/** Cloud demo login — credentials stay server-side (never VITE_ / never in the client bundle). */
export const signInDemoAccount = createServerFn({ method: "POST" }).handler(
  async (): Promise<DemoSignInResult> => {
    const creds = getDemoCredentials();
    if (!creds) return { ok: false };

    const supabase = createServerAuthClient();

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword(
      creds,
    );
    if (!signInError && signInData.session) {
      return {
        ok: true,
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
      };
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(creds);
    if (!signUpError && signUpData.session) {
      return {
        ok: true,
        access_token: signUpData.session.access_token,
        refresh_token: signUpData.session.refresh_token,
      };
    }

    const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword(creds);
    if (!retryError && retryData.session) {
      return {
        ok: true,
        access_token: retryData.session.access_token,
        refresh_token: retryData.session.refresh_token,
      };
    }

    return { ok: false };
  },
);
