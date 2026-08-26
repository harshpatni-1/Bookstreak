import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the email-confirmation / magic-link / password-recovery exchange.
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  // Determine the true public origin (handles Vercel / custom domains / reverse proxies)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const siteUrlEnv = process.env.NEXT_PUBLIC_SITE_URL;

  let origin = requestUrl.origin;
  if (siteUrlEnv && !siteUrlEnv.includes("localhost")) {
    origin = siteUrlEnv.replace(/\/$/, "");
  } else if (forwardedHost) {
    origin = `${forwardedProto}://${forwardedHost}`;
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // If the user requested password reset/update, send them directly there
        if (next.startsWith("/update-password")) {
          return NextResponse.redirect(`${origin}${next}`);
        }

        // Check if user is onboarded
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarded")
            .eq("id", user.id)
            .maybeSingle();

          if (!profile || !profile.onboarded) {
            return NextResponse.redirect(`${origin}/onboarding`);
          }
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // Fall through to redirect to /login
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);

}
