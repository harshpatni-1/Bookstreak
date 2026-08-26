import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Per-request Supabase client bound to the user's auth cookies.
export async function createClient() {
  const cookieStore = await cookies();
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://dyyhiclpffoicgjdnvmc.supabase.co";

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5eWhpY2xwZmZvaWNnamRudm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NjQyODIsImV4cCI6MjA5NzM0MDI4Mn0.tUIZ6xrKtYhjtcziIhpr3vMFMu193LBph8RhDqaQNX8";

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component; middleware refreshes the session instead.
        }
      },
    },
  });
}

// Service-role client for trusted server-only writes (e.g. book_cache).
// Never import this into client components.
export function createServiceClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://dyyhiclpffoicgjdnvmc.supabase.co";

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5eWhpY2xwZmZvaWNnamRudm1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTc2NDI4MiwiZXhwIjoyMDk3MzQwMjgyfQ.xEO3fGs6RrqnrWkmOF4rrjcw5R-_Z_bgS1sPEtk2Q28";

  return createServerClient(url, key, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

