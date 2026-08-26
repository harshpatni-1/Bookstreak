import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
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

  return createBrowserClient(url, key);
}


