import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // The Stripe webhook and static assets are excluded from auth redirection
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|manifest.json|robots.txt|sitemap.xml|api/billing/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)",
  ],
};

