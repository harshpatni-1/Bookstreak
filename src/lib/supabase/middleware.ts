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
  "/manifest.webmanifest",
  "/manifest.json",
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const path = request.nextUrl.pathname;
  const isPublic =
    PUBLIC_PATHS.some((p) => path.startsWith(p)) ||
    MARKETING_PATHS.includes(path) ||
    path.endsWith(".webmanifest") ||
    path.endsWith(".png") ||
    path.endsWith(".svg") ||
    path.endsWith(".ico") ||
    path.endsWith(".jpg");


  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://dyyhiclpffoicgjdnvmc.supabase.co";

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5eWhpY2xwZmZvaWNnamRudm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NjQyODIsImV4cCI6MjA5NzM0MDI4Mn0.tUIZ6xrKtYhjtcziIhpr3vMFMu193LBph8RhDqaQNX8";

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
