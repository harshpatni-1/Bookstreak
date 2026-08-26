import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix: tell Next.js THIS directory is the workspace root,
  // not the parent /home/harsh/ where a stray lockfile exists.
  outputFileTracingRoot: resolve(__dirname),
  images: {
    remotePatterns: [{ protocol: "https", hostname: "covers.openlibrary.org" }],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "https://dyyhiclpffoicgjdnvmc.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5eWhpY2xwZmZvaWNnamRudm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NjQyODIsImV4cCI6MjA5NzM0MDI4Mn0.tUIZ6xrKtYhjtcziIhpr3vMFMu193LBph8RhDqaQNX8",
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_SITE_URL ||
      process.env.SITE_URL ||
      "https://bookstreak.vercel.app",
    SUPABASE_SERVICE_ROLE_KEY:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5eWhpY2xwZmZvaWNnamRudm1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTc2NDI4MiwiZXhwIjoyMDk3MzQwMjgyfQ.xEO3fGs6RrqnrWkmOF4rrjcw5R-_Z_bgS1sPEtk2Q28",
  },
};

export default nextConfig;

