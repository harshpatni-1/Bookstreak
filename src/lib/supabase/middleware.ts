import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Reachable without a session. Password recovery must be here or a locked-out
// reader can never start a reset — they'd be bounced straight back to /login.
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/auth",
  "/forgot-password",
  "/update-password",
];
const MARKETING_PATHS = [
  "/",
  "/features",
  "/pricing",
  "/faq",
  "/privacy",
  "/terms",
  "/contact",
  "/support",
  "/robots.txt",
  "/sitemap.xml",
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const path = request.nextUrl.pathname;
  const isPublic =
    PUBLIC_PATHS.some((p) => path.startsWith(p)) ||
    MARKETING_PATHS.includes(path);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isUnconfigured = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("YOUR-PROJECT");

  // Helper to preserve cookies across redirects
  const createRedirect = (targetPath: string) => {
    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, c);
    });
    return redirectResponse;
  };

  if (isUnconfigured) {
    // If Supabase is not configured yet, don't trap the user in redirect loops.
    // Allow public pages to load and redirect protected routes to /login.
    if (!isPublic) {
      return createRedirect("/login");
    }
    return response;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !isPublic) {
      return createRedirect("/login");
    }

    if (user && (path === "/login" || path === "/signup")) {
      return createRedirect("/dashboard");
    }
  } catch (err) {
    if (!isPublic) {
      return createRedirect("/login");
    }
  }

  return response;
}
