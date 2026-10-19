import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * /auth/callback — Supabase OAuth & email confirmation handler.
 * Exchanges the code for a session, then redirects to the intended
 * destination (dashboard or the page that triggered auth).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful auth — redirect to dashboard (or intended page)
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  // If no code or exchange failed, redirect to login with error flag
  return NextResponse.redirect(
    `${origin}/auth?mode=login&error=auth_callback_failed`
  );
}
