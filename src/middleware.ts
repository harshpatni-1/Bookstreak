import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // The Stripe webhook is excluded deliberately: it authenticates with a
    // signature, not a session cookie, so running the auth redirect over it
    // would bounce every delivery to /login.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/billing/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
