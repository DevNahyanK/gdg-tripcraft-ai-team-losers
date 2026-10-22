import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

/**
 * /auth/callback — Supabase OAuth & email confirmation handler.
 * Exchanges the auth code for a session, then redirects to the intended
 * destination (dashboard or the page that triggered auth).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawRedirect =
    searchParams.get("redirect") ?? searchParams.get("next") ?? "/dashboard";

  // Check if provider returned an error parameter
  const errorParam =
    searchParams.get("error_description") || searchParams.get("error");
  if (errorParam) {
    console.error("[AUTH CALLBACK ERROR]:", errorParam);
    const errorUrl = new URL("/auth", origin);
    errorUrl.searchParams.set("mode", "login");
    errorUrl.searchParams.set("error", errorParam);
    return NextResponse.redirect(errorUrl.toString());
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Determine origin cleanly considering reverse proxies (e.g. Vercel)
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      const sanitizedRedirect = rawRedirect.startsWith("/")
        ? rawRedirect
        : `/${rawRedirect}`;

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${sanitizedRedirect}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(
          `https://${forwardedHost}${sanitizedRedirect}`
        );
      } else {
        return NextResponse.redirect(`${origin}${sanitizedRedirect}`);
      }
    } else {
      console.error("[AUTH CALLBACK EXCHANGE ERROR]:", exchangeError);
      const errorUrl = new URL("/auth", origin);
      errorUrl.searchParams.set("mode", "login");
      errorUrl.searchParams.set("error", exchangeError.message);
      return NextResponse.redirect(errorUrl.toString());
    }
  }

  // If no code, redirect to login with error flag
  return NextResponse.redirect(
    `${origin}/auth?mode=login&error=auth_callback_failed`
  );
}
